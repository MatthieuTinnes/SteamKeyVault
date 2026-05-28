import logging

logger = logging.getLogger(__name__)


def read_request_file(
    request,
    initial_bytes: bytes | None = None,
    fallback_body: bool = False,
) -> bytes | None:
    """Read uploaded file bytes from a Ninja/Django request.

    Priority order:
    1. ``initial_bytes`` if already provided (e.g. Ninja populates a ``file`` parameter).
    2. ``request.FILES['file']`` (multipart/form-data upload).
    3. Raw ``request.body`` when ``fallback_body=True``.

    Returns bytes on success, or ``None`` if nothing could be read.
    """
    if initial_bytes:
        return initial_bytes
    uploaded = getattr(request, 'FILES', None)
    if uploaded:
        f = uploaded.get('file')
        if f:
            try:
                return f.read()
            except Exception:
                logger.warning("Failed to read uploaded file", exc_info=True)
    if fallback_body:
        try:
            return request.body or None
        except Exception:
            logger.warning("Failed to read request body", exc_info=True)
    return None
