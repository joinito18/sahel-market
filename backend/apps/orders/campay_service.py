import requests
from django.conf import settings


def normalize_phone(phone):
    """Normalise un numéro camerounais au format 237XXXXXXXXX."""
    phone = ''.join(filter(str.isdigit, str(phone)))
    if phone.startswith('00'):
        phone = phone[2:]
    if phone.startswith('237'):
        return phone
    if len(phone) == 9:
        return '237' + phone
    return phone


class CampayError(Exception):
    pass


class CampayService:
    BASE_URL = 'https://campay.net/api'

    @classmethod
    def is_configured(cls):
        return bool(
            getattr(settings, 'CAMPAY_USERNAME', '') and
            getattr(settings, 'CAMPAY_PASSWORD', '')
        )

    @classmethod
    def _token(cls):
        resp = requests.post(
            f'{cls.BASE_URL}/token/',
            json={
                'username': settings.CAMPAY_USERNAME,
                'password': settings.CAMPAY_PASSWORD,
            },
            timeout=10,
        )
        if not resp.ok:
            raise CampayError(f'Auth Campay échouée : {resp.text}')
        return resp.json()['token']

    @classmethod
    def collect(cls, amount_xaf, phone, description, external_ref):
        """
        Initie un paiement USSD push via Campay.
        Retourne le dict Campay : {'reference': str, 'status': str, ...}
        Lève CampayError en cas d'échec.
        """
        token = cls._token()
        webhook = getattr(settings, 'CAMPAY_WEBHOOK_URL', '')
        payload = {
            'amount':             str(int(amount_xaf)),
            'currency':           'XAF',
            'from':               normalize_phone(phone),
            'description':        description,
            'external_reference': external_ref,
        }
        if webhook:
            payload['redirect_url'] = webhook

        resp = requests.post(
            f'{cls.BASE_URL}/collect/',
            json=payload,
            headers={'Authorization': f'Token {token}'},
            timeout=30,
        )
        if not resp.ok:
            raise CampayError(f'Collect Campay échoué : {resp.text}')
        return resp.json()

    @classmethod
    def get_transaction(cls, reference):
        """Vérifie le statut d'une transaction Campay par sa référence."""
        token = cls._token()
        resp = requests.get(
            f'{cls.BASE_URL}/transaction/{reference}/',
            headers={'Authorization': f'Token {token}'},
            timeout=10,
        )
        if not resp.ok:
            raise CampayError(f'Statut Campay échoué : {resp.text}')
        return resp.json()
