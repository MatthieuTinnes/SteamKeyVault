import logging
from typing import Iterable

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


class Mailer:
    """Utility class to send templated emails.

    Usage:
        Mailer.send_template_email(
            subject='Welcome',
            template_name='emails/welcome.html',
            context={'username': 'Alice'},
            to_emails=['alice@example.com']
        )
    """

    @classmethod
    def send_template_email(cls, subject: str, template_name: str, context: dict, to_emails: Iterable[str], from_email: str | None = None, fail_silently: bool = True) -> bool:
        from_email = from_email or getattr(settings, 'DEFAULT_FROM_EMAIL', None)
        try:
            html_content = render_to_string(template_name, context)
            text_content = strip_tags(html_content)

            msg = EmailMultiAlternatives(subject=subject, body=text_content, from_email=from_email, to=list(to_emails))
            msg.attach_alternative(html_content, 'text/html')
            msg.send(fail_silently=fail_silently)
            logger.info('Sent email "%s" to %s', subject, to_emails)
            return True
        except Exception as e:
            logger.exception('Failed to send email "%s" to %s: %s', subject, to_emails, e)
            return False
