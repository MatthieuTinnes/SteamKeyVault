"""Management command to run the APScheduler background scheduler."""
import logging

from django.core.management.base import BaseCommand
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from django_apscheduler.jobstores import DjangoJobStore
from django_apscheduler import util

from steamkeyvault.steam.helpers import fetch_and_store_steam_apps

logger = logging.getLogger(__name__)


@util.close_old_connections
def sync_steam_apps():
    """Scheduled task: fetch and sync all Steam apps from the Steam API."""
    logger.info("Scheduled task: starting Steam app sync")
    result = fetch_and_store_steam_apps()
    if isinstance(result, dict):
        logger.info("Scheduled task: Steam app sync completed. Stored: %d", result.get("stored", 0))
    else:
        logger.error("Scheduled task: Steam app sync failed")


class Command(BaseCommand):
    help = "Starts the APScheduler to run background jobs"

    def handle(self, *args, **options):
        scheduler = BlockingScheduler(timezone="UTC")
        scheduler.add_jobstore(DjangoJobStore(), "default")

        scheduler.add_job(
            sync_steam_apps,
            trigger=CronTrigger(hour=2, minute=0),
            id="sync_steam_apps",
            max_instances=1,
            replace_existing=True,
        )
        logger.info("Registered job: sync_steam_apps — runs daily at 02:00 UTC")

        try:
            logger.info("Starting scheduler...")
            scheduler.start()
        except KeyboardInterrupt:
            logger.info("Scheduler stopped by user (KeyboardInterrupt)")
            scheduler.shutdown()
            logger.info("Scheduler shut down successfully")
