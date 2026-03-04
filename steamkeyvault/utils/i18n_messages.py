USER_ERROR_MESSAGES = {
    'internal_error': {
        'en': 'An internal error occurred. Please try again.',
        'fr': 'Une erreur interne est survenue. Veuillez réessayer.',
    },
    'captcha_required': {
        'en': 'Please complete the captcha.',
        'fr': 'Veuillez compléter le captcha.',
    },
    'captcha_invalid': {
        'en': 'Captcha verification failed. Please try again.',
        'fr': 'La vérification du captcha a échoué. Veuillez réessayer.',
    },
    'encryption_not_initialized': {
        'en': 'Encryption not initialized for this account',
        'fr': 'Chiffrement non initialisé pour ce compte',
    },
    'invalid_credentials': {
        'en': 'Invalid credentials',
        'fr': 'Identifiants invalides',
    },
    'email_exists': {
        'en': 'Email already exists',
        'fr': "L'email existe déjà",
    },
    'username_exists': {
        'en': 'Username already exists',
        'fr': "Le nom d'utilisateur existe déjà",
    },
    'registration_conflict': {
        'en': 'An account with this email or username already exists.',
        'fr': "Un compte avec cet email ou ce nom d'utilisateur existe déjà.",
    },
    'invalid_email_format': {
        'en': 'Invalid email format',
        'fr': "Format d'email invalide",
    },
    'invalid_language': {
        'en': 'Invalid language',
        'fr': 'Langue invalide',
    },
    'current_password_incorrect': {
        'en': 'Current password is incorrect',
        'fr': 'Le mot de passe actuel est incorrect',
    },
    'user_not_found': {
        'en': 'User not found',
        'fr': 'Utilisateur introuvable',
    },
    'recovery_data_unavailable': {
        'en': 'Recovery data not available',
        'fr': 'Données de récupération indisponibles',
    },
    'verification_invalid_or_expired': {
        'en': 'This verification link is invalid or has expired.',
        'fr': 'Ce lien de vérification est invalide ou a expiré.',
    },
    'verification_invalid': {
        'en': 'Invalid verification link.',
        'fr': 'Lien de vérification invalide.',
    },
    'verification_error': {
        'en': 'An error occurred during verification.',
        'fr': 'Une erreur est survenue pendant la vérification.',
    },
    'confirmation_invalid_or_expired': {
        'en': 'This confirmation link is invalid or has expired.',
        'fr': 'Ce lien de confirmation est invalide ou a expiré.',
    },
    'confirmation_invalid': {
        'en': 'Invalid confirmation link.',
        'fr': 'Lien de confirmation invalide.',
    },
    'confirmation_error': {
        'en': 'An error occurred during confirmation.',
        'fr': 'Une erreur est survenue pendant la confirmation.',
    },
    'email_already_verified': {
        'en': 'Email is already verified.',
        'fr': "L'email est déjà vérifié.",
    },
    'reset_token_invalid_or_expired': {
        'en': 'Invalid or expired reset token',
        'fr': 'Jeton de réinitialisation invalide ou expiré',
    },
}

PASSWORD_ERROR_MESSAGES = {
    'password_min_length': {
        'en': 'Password must be at least 12 characters long',
        'fr': 'Le mot de passe doit contenir au moins 12 caractères',
    },
    'password_lowercase': {
        'en': 'Password must contain at least one lowercase letter',
        'fr': 'Le mot de passe doit contenir au moins une minuscule',
    },
    'password_uppercase': {
        'en': 'Password must contain at least one uppercase letter',
        'fr': 'Le mot de passe doit contenir au moins une majuscule',
    },
    'password_digit': {
        'en': 'Password must contain at least one digit',
        'fr': 'Le mot de passe doit contenir au moins un chiffre',
    },
    'password_special': {
        'en': "Password must contain at least one special character (#?!@$%^&*-'+()_[])",
        'fr': "Le mot de passe doit contenir au moins un caractère spécial (#?!@$%^&*-'+()_[])",
    },
}

ADMIN_ERROR_MESSAGES = {
    'auth_required': {
        'en': 'Authentication required',
        'fr': 'Authentification requise',
    },
    'admin_required': {
        'en': 'Admin privileges required',
        'fr': 'Privilèges administrateur requis',
    },
}

GAME_ERROR_MESSAGES = {
    'name_required': {
        'en': 'Name is required.',
        'fr': 'Le nom est requis.',
    },
    'user_has_game': {
        'en': 'User already has this game.',
        'fr': 'Vous avez déjà ce jeu.',
    },
    'game_not_found': {
        'en': 'Game not found for this user.',
        'fr': 'Jeu introuvable pour cet utilisateur.',
    },
    'usergame_not_found': {
        'en': 'UserGame not found.',
        'fr': 'Jeu utilisateur introuvable.',
    },
    'duplicate_steam_app': {
        'en': 'User already has a game with this Steam App ID.',
        'fr': 'Vous avez déjà un jeu avec cet App ID Steam.',
    },
    'name_empty': {
        'en': 'Name cannot be empty.',
        'fr': 'Le nom ne peut pas être vide.',
    },
    'no_json_payload': {
        'en': 'No JSON payload provided',
        'fr': 'Aucune charge JSON fournie',
    },
    'file_too_large': {
        'en': 'File too large. Maximum size is 10 MB.',
        'fr': 'Fichier trop volumineux. La taille maximale est de 10 Mo.',
    },
    'invalid_json_payload': {
        'en': 'Invalid JSON payload',
        'fr': 'Charge JSON invalide',
    },
    'invalid_format_version': {
        'en': 'Invalid SteamKeyVault format or version',
        'fr': 'Format ou version SteamKeyVault invalide',
    },
    'import_too_many_games': {
        'en': 'Import contains too many games (maximum 2000).',
        'fr': "L'import contient trop de jeux (maximum 2000).",
    },
}

KEY_ERROR_MESSAGES = {
    'key_not_found': {
        'en': 'Key not found for this user and game.',
        'fr': 'Clé introuvable pour cet utilisateur et ce jeu.',
    },
    'key_already_used': {
        'en': 'Key is already used.',
        'fr': 'La clé est déjà utilisée.',
    },
    'key_required': {
        'en': 'Key is required to create a share link.',
        'fr': 'La clé est requise pour créer un lien de partage.',
    },
    'share_create_failed': {
        'en': 'Unable to create share link. Please try again.',
        'fr': "Impossible de créer le lien de partage. Veuillez réessayer.",
    },
    'share_expired': {
        'en': 'Share link has expired.',
        'fr': 'Le lien de partage a expiré.',
    },
    'share_already_used': {
        'en': 'Share link has already been used.',
        'fr': 'Le lien de partage a déjà été utilisé.',
    },
    'captcha_required': {
        'en': 'Captcha token is required.',
        'fr': 'Le captcha est requis.',
    },
    'captcha_failed': {
        'en': 'Captcha validation failed.',
        'fr': 'La validation du captcha a échoué.',
    },
    'message_already_sent': {
        'en': 'Thank-you message has already been sent.',
        'fr': 'Le message de remerciement a déjà été envoyé.',
    },
    'message_too_short': {
        'en': 'Message is too short (min 3 characters).',
        'fr': 'Le message est trop court (minimum 3 caractères).',
    },
    'message_too_long': {
        'en': 'Message is too long (max 100 characters).',
        'fr': 'Le message est trop long (maximum 100 caractères).',
    },
    'email_send_failed': {
        'en': 'Failed to send email.',
        'fr': "Échec de l'envoi de l'email.",
    },
}

JOB_ERROR_MESSAGES = {
    'file_missing': {
        'en': 'No file provided',
        'fr': 'Aucun fichier fourni',
    },
    'file_too_large': {
        'en': 'File too large. Maximum size is 10 MB.',
        'fr': 'Fichier trop volumineux. La taille maximale est de 10 Mo.',
    },
    'job_not_found': {
        'en': 'Job not found',
        'fr': 'Tâche introuvable',
    },
}

STEAM_ERROR_MESSAGES = {
    'fetch_failed': {
        'en': 'Failed to fetch app details from Steam',
        'fr': "Impossible de récupérer les détails de l'app depuis Steam",
    },
    'steam_error': {
        'en': 'Steam Store returned error',
        'fr': 'Le Steam Store a renvoyé une erreur',
    },
    'invalid_response': {
        'en': 'Invalid response from Steam Store',
        'fr': 'Réponse invalide du Steam Store',
    },
    'details_unavailable': {
        'en': 'App details not available',
        'fr': "Détails de l'app indisponibles",
    },
    'missing_api_key': {
        'en': 'Server configuration error: STEAM_API_KEY not set',
        'fr': 'Erreur de configuration serveur : STEAM_API_KEY non défini',
    },
    'connect_failed': {
        'en': 'Failed to connect to Steam API',
        'fr': "Impossible de se connecter à l'API Steam",
    },
    'fetch_failed_status': {
        'en': 'Failed to fetch from Steam API',
        'fr': "Échec de récupération depuis l'API Steam",
    },
    'invalid_json': {
        'en': 'Invalid JSON response from Steam API',
        'fr': "Réponse JSON invalide de l'API Steam",
    },
}
