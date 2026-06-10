from ninja import Router, Schema
from typing import Optional, List, Dict
from steamkeyvault.jobs.models import ImportJob
from steamkeyvault.keys.models import Key
from steamkeyvault.games.models import UserGame
from steamkeyvault.steam.models import SteamApp
from ninja.security import django_auth
import csv
import io
import threading
import logging
from steamkeyvault.utils.i18n import get_request_locale, translate_message
from steamkeyvault.utils.i18n_messages import JOB_ERROR_MESSAGES
from steamkeyvault.utils.request_utils import read_request_file

jobs_router = Router()

logger = logging.getLogger(__name__)



class ImportCreateOut(Schema):
    job_id: int


@jobs_router.post('/import/create', response={200: ImportCreateOut, 400: dict}, auth=django_auth)
def create_import(request, file: bytes = None):
    """Accepts CSV file content as raw bytes (multipart/form-data file expected).

    CSV format: gameName;key1;key2
    """
    max_size = 10 * 1024 * 1024
    user = request.user
    # Ninja may or may not populate `file` for multipart; fallback to Django FILES
    file = read_request_file(request, initial_bytes=file)
    if not file:
        locale = get_request_locale(request, request.user)
        return 400, {"error": translate_message(JOB_ERROR_MESSAGES, 'file_missing', locale)}
    if len(file) > max_size:
        locale = get_request_locale(request, request.user)
        return 400, {"error": translate_message(JOB_ERROR_MESSAGES, 'file_too_large', locale)}

    job = ImportJob.objects.create(user=user, status="pending")

    # Start background thread to process
    def process_job(job_id, file_bytes):
        job = ImportJob.objects.get(id=job_id)
        try:
            job.start()
            text = file_bytes.decode('utf-8')
            reader = csv.reader(io.StringIO(text), delimiter=';')
            rows = [r for r in reader if r and any(c.strip() for c in r)]
            job.total = len(rows)
            job.progress = 0
            job.save()

            results = []
            for idx, row in enumerate(rows):
                try:
                    game_name = row[0].strip()
                    keys = [k.strip() for k in row[1:] if k.strip()]

                    # attempt steam search: prefix search then fallback to custom
                    steam_match = SteamApp.objects.filter(name__istartswith=game_name).order_by('name').first()
                    if steam_match:
                        user_game, created = UserGame.objects.get_or_create(
                            user=job.user,
                            steamapp_id=steam_match.id,
                            defaults={"name": steam_match.name},
                        )
                        if not created and user_game.name != steam_match.name:
                            user_game.name = steam_match.name
                            user_game.save(update_fields=["name"])
                    else:
                        user_game, _ = UserGame.objects.get_or_create(
                            user=job.user,
                            name=game_name,
                            steamapp_id=None,
                        )

                    created_keys = []
                    for k in keys:
                        key_obj = Key.objects.create(key=k, userGame=user_game)
                        created_keys.append(key_obj.id)

                    results.append({"game": game_name, "created_keys": created_keys})
                except Exception as e:
                    logger.exception("Error processing row %s", row)
                    results.append({"game": row[0] if row else None, "error": str(e)})

                job.progress = idx + 1
                job.result = results
                job.save()

            job.finish(success=True)
        except Exception as e:
            logger.exception("Import job failed: %s", e)
            job.error = str(e)
            job.finish(success=False)

    thread = threading.Thread(target=process_job, args=(job.id, file))
    thread.daemon = True
    thread.start()

    return 200, {"job_id": job.id}


class ImportStatusOut(Schema):
    id: int
    status: str
    progress: int
    total: int
    error: Optional[str] = None
    result: Optional[List[Dict]] = None


@jobs_router.get('/import/status/{job_id}/', response=ImportStatusOut, auth=django_auth)
def import_status(request, job_id: int):
    try:
        job = ImportJob.objects.get(id=job_id, user=request.user)
    except ImportJob.DoesNotExist:
        locale = get_request_locale(request, request.user)
        return 404, {"error": translate_message(JOB_ERROR_MESSAGES, 'job_not_found', locale)}

    return {
        "id": job.id,
        "status": job.status,
        "progress": job.progress,
        "total": job.total,
        "error": job.error,
        "result": job.result,
    }
