import { createI18n } from 'vue-i18n'

const LOCALE_STORAGE_KEY = 'steamkeyvault-locale'
const SUPPORTED_LOCALES = ['en', 'fr'] as const

type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

const messages = {
  en: {
    app: {
      name: 'SteamKeyVault',
      logoAlt: 'Logo'
    },
    nav: {
      documentation: 'Documentation',
      myKeys: 'My Keys',
      login: 'Login',
      register: 'Register',
      myAccount: 'My Account',
      admin: 'Admin',
      logout: 'Logout',
      toggleNav: 'Toggle navigation'
    },
    theme: {
      dark: 'Dark Mode',
      light: 'Light Mode'
    },
    locale: {
      label: 'Language',
      en: 'English',
      fr: 'French'
    },
    common: {
      cancel: 'Cancel',
      close: 'Close',
      delete: 'Delete',
      save: 'Save',
      ok: 'OK',
      apply: 'Apply',
      refresh: 'Refresh',
      backToDashboard: 'Back to Dashboard',
      backToAccount: 'Back to Account',
      backToLogin: 'Back to Login',
      backToHome: 'Go to Home',
      loading: 'Loading...',
      error: 'Error',
      info: 'Info',
      unknownError: 'Unknown error'
    },
    home: {
      heroTitle: 'Your Steam Keys, Simplified',
      heroSubtitle: 'SteamKeyVault is the easiest way to securely store, organize, and trade your Steam keys.',
      getStarted: 'Get started',
      learnMore: 'Learn More',
      featuresTitle: 'Why Choose SteamKeyVault?',
      featuresDesc: 'Discover the features that make SteamKeyVault the best solution for Steam key collectors, traders, and gamers.',
      features: [
        {
          title: 'End-to-End Encryption',
          desc: 'Your Steam keys are encrypted before they leave your device, ensuring only you can access them.'
        },
        {
          title: 'Easy Trading',
          desc: 'Share and trade keys with friends or partners in just a few clicks, with full control and privacy.'
        },
        {
          title: 'Access Anywhere',
          desc: 'Your collection is always available, whether you are on desktop, tablet, or mobile.'
        },
        {
          title: 'Organize & Search',
          desc: 'Tag, categorize, and search your keys for instant access and better management.'
        },
        {
          title: 'One-Click Import',
          desc: 'Quickly import keys from bundles, emails, or CSV files.'
        },
        {
          title: 'Secure Sharing',
          desc: 'Generate secure, time-limited links to share keys safely.'
        }
      ],
      discoverTitle: 'Trade, Store, and Access Anywhere',
      discoverDesc: 'With SteamKeyVault, your keys are always at your fingertips. Trade securely, store with confidence, and access your collection from any device.',
      discoverFeatures: [
        {
          title: 'Trade with Confidence',
          desc: 'Built-in escrow and audit trail for every trade.'
        },
        {
          title: 'Store Securely',
          desc: 'All keys are protected with industry-leading encryption.'
        },
        {
          title: 'Access Anywhere',
          desc: 'Your vault is always available, on any device.'
        }
      ],
      faqTitle: 'Frequently Asked Questions',
      faqs: [
        {
          q: 'How secure is SteamKeyVault?',
          a: 'All keys are encrypted end-to-end. Only you have the decryption key, not even we can see your keys.'
        },
        {
          q: 'Can I trade keys with others?',
          a: 'Yes! You can securely trade or share keys with anyone, even if they do not have a SteamKeyVault account.'
        },
        {
          q: 'How do I import my existing keys?',
          a: 'Use our one-click import tool to add keys from bundles, emails, or CSV files.'
        },
        {
          q: 'Is SteamKeyVault free?',
          a: 'You can get started for free. Premium features are available for power users and traders.'
        }
      ]
    },
    about: {
      title: 'About',
      body: 'This is an about page'
    },
    docs: {
      eyebrow: 'User guide',
      title: 'SteamKeyVault Documentation',
      subtitle: 'A simple guide to protect your keys, manage your library, and share with confidence.',
      quickAccess: 'Quick access',
      toc: {
        encryption: 'Encryption and benefits',
        importExport: 'Import and export',
        sharing: 'Share a key by link',
        customVsSteam: 'Custom games vs Steam',
        lestrades: 'lestrades.com export',
        deleteUsed: 'Delete used keys',
        qa: 'Q&A'
      },
      encryption: {
        title: 'Encryption and benefits',
        body: 'Your keys are encrypted in your browser before they are sent to the server. This means only you can see the keys in plain text when you are logged in.',
        whyTitle: 'Why this protects you',
        whyList: [
          'Your keys are unreadable to anyone who does not have your login session.',
          'If a backup or database snapshot leaks, the keys remain protected.',
          'Exports are decrypted only on your device, right before download.'
        ],
        expectTitle: 'What to expect as a user',
        expectList: [
          'After logout or clearing the browser, you need to log in again to see keys.',
          'Imports are protected locally before upload, so your data stays private.'
        ]
      },
      importExport: {
        title: 'Import and export',
        managePrefix: 'You can manage imports and exports from',
        manageMiddle: 'and the',
        manageSuffix: 'page.',
        csvImportTitle: 'CSV or TXT import',
        csvImportSteps: [
          'Open the Import page.',
          'Drop your file or click Select File.',
          'Expected format: gameName;key1;key2 (one line per game).',
          'A progress panel shows results and errors.'
        ],
        csvImportNote: 'Max file size: 10 MB.',
        csvExportTitle: 'CSV export',
        csvExportSteps: [
          'In My Account, click Export CSV.',
          'Your file is prepared and decrypted locally on your device.'
        ],
        jsonTitle: 'JSON import or export (SteamKeyVault)',
        jsonItems: [
          'JSON export keeps the SteamKeyVault structure for easy re-import.',
          'JSON import encrypts keys locally before upload.'
        ]
      },
      sharing: {
        title: 'Share a key by link',
        body: 'You can generate a temporary link for any key and send it to someone. The recipient reveals the key on a public page.',
        createTitle: 'Create a link',
        createSteps: [
          'Open My Keys.',
          'Click the share icon on a key.',
          'Copy the link and send it.'
        ],
        behaviorTitle: 'How it behaves',
        behaviorList: [
          'The link has an expiration date.',
          'The key can be revealed only once.',
          'A captcha protects the key from bots.',
          'You can disable the link from the share dialog.'
        ]
      },
      customVsSteam: {
        title: 'Custom games vs Steam games',
        body: 'SteamKeyVault supports Steam-linked games and custom games that are not on Steam.',
        steamTitle: 'Steam games',
        steamList: [
          'Linked to a Steam App ID.',
          'Title, images, and publisher are filled automatically.'
        ],
        customTitle: 'Custom games',
        customList: [
          'Create a game with any name you want.',
          'Later, you can match it to a Steam game.',
          'If a Steam App ID becomes invalid, the game stays custom.'
        ]
      },
      lestrades: {
        title: 'lestrades.com export',
        body: 'This export creates a text format you can paste directly into lestrades.com.',
        whereTitle: 'Where to find it',
        whereSteps: [
          'Open My Keys.',
          'Click the three dots menu at the top of the games column.',
          'Select Export for lestrades.com.'
        ],
        formatTitle: 'Format',
        formatList: [
          'One game per line.',
          'Steam game: GameName/steamAppId.',
          'Custom game: GameName.',
          'The result is copied to your clipboard.'
        ]
      },
      deleteUsed: {
        title: 'Delete used keys',
        body: 'You can remove all keys that are marked as used in a single action.',
        stepsTitle: 'Steps',
        steps: [
          'Open My Keys.',
          'Open the three dots menu in the games column.',
          'Choose Delete all used keys and confirm.'
        ],
        note: 'This action cannot be undone.'
      },
      qa: {
        title: 'Q&A',
        items: [
          {
            q: 'Do you store my keys in plain text?',
            a: 'No. Your keys are encrypted before they leave your device.'
          },
          {
            q: 'Can I share a key safely?',
            a: 'Yes. Share links are temporary, can be disabled, and allow a single reveal.'
          },
          {
            q: 'What happens if a Steam game is removed?',
            a: 'The game stays in your library as a custom game, so you do not lose your data.'
          },
          {
            q: 'Can I move my library to another account?',
            a: 'Yes. Export your data and import it into another account anytime.'
          }
        ]
      }
    },
    account: {
      title: 'My Account',
      stats: {
        totalGames: 'Total Games',
        totalKeys: 'Total Keys',
        accountStatus: 'Account Status',
        verified: 'Verified',
        unverified: 'Unverified'
      },
      data: {
        title: 'Data Management',
        desc: 'Import or export your game library data. CSV format contains game names and keys separated by semicolons. JSON format follows the SteamKeyVault schema.',
        importCsv: 'Import CSV',
        exportCsv: 'Export CSV',
        importJson: 'Import JSON (SteamKeyVault)',
        exportJson: 'Export JSON (SteamKeyVault)'
      },
      email: {
        title: 'Email Settings',
        desc: 'Manage your email address and verification.',
        label: 'Email Address',
        placeholder: 'your@email.com',
        invalid: 'Please enter a valid email address.',
        pending: 'Change pending. Check {email} for confirmation.',
        unverified: 'Please check your inbox to verify your email.',
        resend: 'Resend Email'
      },
      security: {
        title: 'Security',
        desc: 'Update your password to keep your account secure.',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        confirmPassword: 'Confirm Password',
        updatePassword: 'Update Password',
        passwordRequirements: "Password must: be 12+ characters, contain lowercase, uppercase, digit, and special character (#?!@$%^&*-'+()_[])"
      },
      preferences: {
        title: 'Preferences',
        desc: 'Adjust your account preferences.',
        language: 'Language'
      },
      toasts: {
        confirmationRequired: 'Confirmation Required',
        emailUpdateRequested: 'Email update requested',
        success: 'Success',
        failedUpdateEmail: 'Failed to update email',
        invalidData: 'Invalid data',
        checkPasswordFields: 'Please check the password fields',
        invalidPassword: 'Invalid password',
        passwordChanged: 'Password changed',
        passwordUpdateFailed: 'Password update failed',
        missingEncryptionContext: 'Missing encryption context. Please log in again.',
        failedAccountStats: 'Failed to load account stats',
        emailSent: 'Email Sent',
        verificationResent: 'Verification email has been resent.',
        failedResendEmail: 'Failed to resend email',
        export: 'Export',
        csvDownloaded: 'CSV downloaded: {filename}',
        jsonDownloaded: 'JSON downloaded: {filename}',
        fileTooLarge: 'File too large',
        maxFileSize: 'Maximum file size is 10 MB.',
        importJson: 'Import JSON',
        gamesKeysCreated: 'Games created: {games}, Keys created: {keys}',
        failedImportJson: 'Failed to import JSON'
      }
    },
    auth: {
      login: {
        title: 'Login',
        email: 'Email',
        password: 'Password',
        submit: 'Login',
        forgot: 'Forgot password?',
        noAccount: "Don't have an account?",
        register: 'Register'
      },
      register: {
        title: 'Register',
        email: 'Email',
        username: 'Username',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        submit: 'Register',
        hasAccount: 'Already have an account?',
        login: 'Login',
        passwordRequirements: "Password must: be 12+ characters, contain lowercase, uppercase, digit, and special character (#?!@$%^&*-'+()_[])",
        errors: {
          passwordMismatch: 'Passwords do not match.',
          registrationFailed: 'Registration failed.'
        },
        success: 'Registration successful! Please save your recovery phrase.'
      },
      recovery: {
        title: 'Recovery Key',
        warning: 'Save this recovery phrase now. It is the only way to recover your data if you forget your password.',
        copy: 'Copy',
        saved: 'I saved it',
        copied: 'Copied',
        copiedDetail: 'Recovery phrase copied',
        copyFailed: 'Failed to copy recovery phrase'
      },
      forgot: {
        title: 'Forgot Password',
        sendLink: 'Send Reset Link',
        success: 'If an account exists for this email, a reset link has been sent.',
        emailSent: 'Email sent',
        emailSentDetail: 'If the account exists, a reset link was sent.',
        resetFailed: 'Reset failed',
        failedToSend: 'Failed to send reset email.'
      },
      reset: {
        title: 'Reset Password',
        validating: 'Validating reset link...',
        recoveryPhrase: 'Recovery Phrase',
        recoveryPlaceholder: 'twelve words',
        newPassword: 'New Password',
        confirmPassword: 'Confirm Password',
        submit: 'Reset Password',
        success: 'Password reset. You can log in now.',
        resetToastTitle: 'Password reset',
        resetToastDetail: 'You can log in with your new password.',
        failed: 'Failed to reset password.',
        invalidLink: 'Reset link is invalid.',
        invalidOrExpired: 'Reset link is invalid or expired.'
      },
      verify: {
        verifyingTitle: 'Verifying your email...',
        verifyingDesc: 'Please wait while we verify your email address.',
        successTitle: 'Email Verified!',
        successDesc: 'You can now log in to your account.',
        goToLogin: 'Go to Login',
        failedTitle: 'Verification Failed',
        failedDefault: 'An error occurred during verification.',
        noToken: 'No verification token provided.',
        invalidLink: 'Invalid or expired verification link.',
        successFallback: 'Email verified successfully!'
      },
      confirmEmail: {
        confirmingTitle: 'Confirming email change...',
        confirmingDesc: 'Please wait while we update your email address.',
        successTitle: 'Email Changed!',
        successDesc: 'Your email address has been updated successfully.',
        failedTitle: 'Confirmation Failed',
        failedDefault: 'An error occurred during confirmation.',
        noToken: 'No confirmation token provided.',
        invalidLink: 'Invalid or expired confirmation link.',
        successFallback: 'Email address changed successfully!',
        goToAccount: 'Go to My Account'
      }
    },
    myKeys: {
      yourGames: 'Your Games',
      moreActions: 'More actions',
      exportLestrades: 'Export for lestrades.com',
      deleteAllUsed: 'Delete all used keys',
      emptyTitle: 'No Game Selected',
      emptyDesc: 'Select a game from the sidebar to view details and manage keys.',
      deleteAllHeader: 'Delete All Used Keys',
      deleteAllMessage: 'Are you sure you want to delete all used keys from all your games? This action cannot be undone.',
      deleteAllCancel: 'Cancel',
      deleteAllConfirm: 'Delete',
      deleteAllSuccess: 'Keys Deleted',
      deleteAllCount: '{count} key{suffix} deleted',
      deleteAllFailed: 'Failed to delete used keys',
      clipboardCopied: 'Copied',
      exportCopied: 'Export copied to clipboard',
      exportCopyFailed: 'Failed to copy export'
    },
    games: {
      filterPlaceholder: 'Filter games...',
      noGamesFound: 'No games found.',
      addGame: 'Add Game',
      addGameHeader: 'Add a Game',
      addCustomLabel: 'Add non-Steam / custom game',
      searchSteamPlaceholder: 'Search for a Steam game...',
      manualNamePlaceholder: 'Enter game name',
      preview: 'Preview:',
      newCustomGame: 'New Custom Game',
      appId: 'App ID: {id}',
      customGame: 'Custom Game',
      convertHeader: 'Match with a Steam game',
      convertDesc: 'Search for the Steam version of this game to enable Steam integration features like images and links.',
      selectedGame: 'Selected Game:',
      convertAction: 'Convert',
      confirmDelete: 'Confirm Delete',
      deleteWarning: 'This game has associated keys. Deleting the game will also permanently delete all its keys.',
      deleteConfirm: 'Are you sure you want to delete this game?',
      customPublisher: 'Custom Game',
      removedFromSteam: 'Removed from Steam',
      matchSteam: 'Match with a Steam game',
      deleteGameTooltip: 'Delete game from library',
      steamRemovedMessage: 'This game has been removed from the Steam store or the App ID is invalid.'
      ,
      deleteFailed: 'Delete Failed',
      deleteFailedDetail: 'Failed to delete game',
      deleteSuccess: 'Deleted',
      deleteSuccessDetail: 'Game deleted',
      deleteUnknownId: 'Could not determine game id',
      placeholderAlt: 'Game placeholder'
    },
    gameInfo: {
      loading: 'Loading...',
      unavailable: 'Game details unavailable.',
      byPublisher: 'by {publisher}',
      metascore: 'Metascore {score}',
      viewCards: 'View Trading Cards on Steam Market',
      viewAchievements: 'View Achievements on Steam',
      viewSteamStore: 'View on Steam Store',
      viewSteamDb: 'View on SteamDB',
      freeToPlay: 'Free to Play',
      commandCopied: 'Command Copied',
      commandCopiedDetail: 'ASF command has been copied to clipboard',
      copyFailed: 'Copy Failed',
      copyFailedDetail: 'Failed to copy command to clipboard'
    },
    keys: {
      addKey: 'Add Key',
      selectGameFirst: 'Please select a game first',
      emptyTitle: 'No keys found. Add a key to start.',
      columnKey: 'Key',
      columnDateAdded: 'Date Added',
      columnUsage: 'Usage',
      columnStatus: 'Status',
      columnActions: 'Actions',
      statusSharing: 'Sharing',
      statusUsed: 'Used',
      statusAvailable: 'Available',
      actionCopyKey: 'Copy Key',
      actionShare: 'Share',
      actionKeyUsed: 'Key already used',
      actionEdit: 'Edit',
      actionDelete: 'Delete',
      addDialogTitle: 'Add Key',
      editDialogTitle: 'Edit Key',
      deleteDialogTitle: 'Confirm Delete',
      shareDialogTitle: 'Share Key',
      keyLabel: 'Key',
      keyPlaceholder: 'XXXXX-XXXXX-XXXXX',
      usageOptional: 'Usage (Optional)',
      usageLabel: 'Usage',
      usagePlaceholder: 'Select usage',
      markUsed: 'Mark as Used',
      saveChanges: 'Save Changes',
      deleteConfirm: 'Are you sure you want to delete this key? This action cannot be undone.',
      shareLink: 'Share Link',
      expiresOn: 'Expires on {date}',
      disableLink: 'Disable Link',
      copyLink: 'Copy Link',
      linkDisabled: 'Link disabled',
      linkDisabledDetail: 'Share link has been disabled',
      shareCopied: 'Share link copied to clipboard',
      keyCopied: 'Key copied to clipboard',
      copyFailed: 'Failed to copy the key',
      copyShareFailed: 'Failed to copy share link',
      disableFailed: 'Failed to disable share link',
      currentUse: {
        keep: 'Keep',
        trade: 'Trade',
        giveaway: 'Giveaway',
        sell: 'Sell',
        other: 'Other'
      }
    },
    import: {
      title: 'Import Games',
      backToAccount: 'Back to Account',
      uploadTitle: 'Upload CSV File',
      uploadDesc: 'Import your game library using a CSV or TXT file.',
      format: 'Format: gameName;key1;key2',
      dropText: 'Drop your CSV file here or click to browse',
      selectFile: 'Select File',
      progressTitle: 'Import Progress',
      processing: 'Processing...',
      results: 'Results',
      keysAdded: '{count} keys added',
      status: {
        pending: 'pending',
        processing: 'processing',
        completed: 'completed',
        failed: 'failed'
      },
      fileTooLarge: 'File too large',
      maxFileSize: 'Maximum file size is 10 MB.',
      upload: 'Upload',
      uploadStarted: 'File uploaded, processing started',
      error: 'Error'
    },
    share: {
      loadingKey: 'Loading the key...',
      offerTitle: '{donor} is offering you a key for {game}',
      validUntil: 'Link valid until {date}',
      expired: 'This link has expired.',
      revealed: 'This link has already been used.',
      used: 'This key is already marked as used.',
      promo: 'This key was shared using SteamKeyVault — manage and share your keys securely.',
      createAccount: 'Create an account',
      revealedKey: 'Revealed key',
      activateSteam: 'Activate on Steam',
      revealKey: 'Reveal key',
      captchaMissing: 'Turnstile captcha is not configured.',
      sendMessageTitle: 'Send a message to the donor',
      messagePlaceholder: 'Write a thank-you message...',
      sendMessage: 'Send message',
      captcha: 'Captcha',
      captchaRequired: 'Please complete the captcha.',
      keyRevealed: 'Key revealed',
      keyRevealedDetail: 'The key is now visible.',
      invalidLink: 'Invalid link.',
      revealFailed: 'Unable to reveal the key.',
      messageTooLong: 'Message must be 100 characters or less.',
      sent: 'Sent',
      messageSent: 'Message sent to the donor.',
      sendFailed: 'Unable to send the message.',
      copied: 'Copied',
      copiedDetail: 'Key copied.',
      copyFailed: 'Unable to copy the key.'
    },
    admin: {
      dashboardTitle: 'Admin Dashboard',
      statsFailed: 'Failed to load admin statistics',
      stats: {
        totalUsers: 'Total Users',
        verifiedUsers: 'Verified Users',
        adminUsers: 'Admin Users',
        totalGames: 'Total Games',
        totalKeys: 'Total Keys'
      },
      sections: {
        userManagement: 'User Management',
        userManagementDesc: 'Manage user accounts, emails, and permissions',
        steamSync: 'Steam Synchronization',
        steamSyncDesc: 'Refresh Steam apps database and view sync statistics',
        actionLogs: 'Action Logs',
        actionLogsDesc: 'Review logins and account changes with filters'
      },
      users: {
        title: 'User Management',
        backToDashboard: 'Back to Dashboard',
        id: 'ID',
        username: 'Username',
        email: 'Email',
        verified: 'Verified',
        admin: 'Admin',
        games: 'Games',
        keys: 'Keys',
        joined: 'Joined',
        actions: 'Actions',
        editUser: 'Edit User',
        newPasswordHint: 'New Password (leave empty to keep current)',
        adminPrivileges: 'Admin Privileges',
        saveChanges: 'Save Changes',
        confirmDelete: 'Confirm Delete',
        confirmClear: 'Confirm Clear',
        deleteUserPrompt: 'Are you sure you want to delete user {username}? This action cannot be undone.',
        clearUserPrompt: 'This will delete all games and keys for {username}. The user account will remain active.',
        deleteGamesKeys: 'Delete Games & Keys',
        userUpdated: 'User updated successfully',
        userDeleted: 'User deleted successfully',
        failedLoadUsers: 'Failed to load users',
        failedUpdateUser: 'Failed to update user',
        failedDeleteUser: 'Failed to delete user',
        failedDeleteGamesKeys: 'Failed to delete games and keys',
        deletedGamesKeys: 'Deleted {games} games and {keys} keys.',
        deletedGamesKeysFallback: 'Games and keys deleted.'
      },
      logs: {
        title: 'User Action Logs',
        refresh: 'Refresh',
        start: 'Start',
        end: 'End',
        action: 'Action',
        userSearch: 'User search',
        userSearchPlaceholder: 'Email or username',
        apply: 'Apply',
        last24h: 'Last 24h',
        showingRange: 'Showing data from {start} to {end}',
        totalActions: 'Total Actions',
        logins: 'Logins',
        passwordChanges: 'Password Changes',
        emailChanges: 'Email Changes',
        uniqueUsers: 'Unique Users',
        allActions: 'All Actions',
        results: '{count} results',
        time: 'Time',
        user: 'User',
        ip: 'IP',
        userAgent: 'User Agent',
        metadata: 'Metadata',
        allActionsOption: 'All actions',
        loginOption: 'Login',
        passwordChangeOption: 'Change password',
        emailChangeOption: 'Change email',
        failedLoad: 'Failed to load action logs'
      },
      steam: {
        title: 'Steam Synchronization',
        statsTitle: 'Steam Database Statistics',
        totalApps: 'Total Steam Apps in DB',
        totalUserGames: 'Total User Games',
        uniqueGamesAdded: 'Unique Games Added',
        actionsTitle: 'Synchronization Actions',
        refreshTitle: 'Refresh Steam Apps Database',
        refreshDesc: 'Fetches the latest list of all Steam applications from the Steam API and updates the local database. This process may take several minutes.',
        refreshButton: 'Refresh Steam Apps',
        refreshComplete: 'Refresh Complete',
        refreshSuccess: 'Successfully refreshed {count} Steam apps in the database.',
        failedLoadStats: 'Failed to load Steam stats',
        failedRefresh: 'Failed to refresh Steam apps'
      }
    },
    validation: {
      password: {
        minLength: 'Password must be at least 12 characters long',
        lowercase: 'Password must contain at least one lowercase letter',
        uppercase: 'Password must contain at least one uppercase letter',
        digit: 'Password must contain at least one digit',
        special: "Password must contain at least one special character (#?!@$%^&*-'+()_[])"
      }
    },
    errors: {
      missingMasterKey: 'Missing master key',
      loginAgain: 'Please log in again.'
    }
  },
  fr: {
    app: {
      name: 'SteamKeyVault',
      logoAlt: 'Logo'
    },
    nav: {
      documentation: 'Documentation',
      myKeys: 'Mes clés',
      login: 'Connexion',
      register: 'Inscription',
      myAccount: 'Mon compte',
      admin: 'Admin',
      logout: 'Déconnexion',
      toggleNav: 'Afficher le menu'
    },
    theme: {
      dark: 'Mode sombre',
      light: 'Mode clair'
    },
    locale: {
      label: 'Langue',
      en: 'Anglais',
      fr: 'Français'
    },
    common: {
      cancel: 'Annuler',
      close: 'Fermer',
      delete: 'Supprimer',
      save: 'Enregistrer',
      ok: 'OK',
      apply: 'Appliquer',
      refresh: 'Actualiser',
      backToDashboard: 'Retour au tableau de bord',
      backToAccount: 'Retour au compte',
      backToLogin: 'Retour à la connexion',
      backToHome: "Aller à l'accueil",
      loading: 'Chargement...',
      error: 'Erreur',
      info: 'Info',
      unknownError: 'Erreur inconnue'
    },
    home: {
      heroTitle: 'Vos clés Steam, simplifiées',
      heroSubtitle: 'SteamKeyVault est le moyen le plus simple de stocker, organiser et échanger vos clés Steam en toute sécurité.',
      getStarted: 'Commencer',
      learnMore: 'En savoir plus',
      featuresTitle: 'Pourquoi choisir SteamKeyVault ?',
      featuresDesc: 'Découvrez les fonctionnalités qui font de SteamKeyVault la meilleure solution pour les collectionneurs, traders et joueurs de clés Steam.',
      features: [
        {
          title: 'Chiffrement de bout en bout',
          desc: 'Vos clés Steam sont chiffrées avant de quitter votre appareil, garantissant que vous seul pouvez y accéder.'
        },
        {
          title: 'Échanges simples',
          desc: 'Partagez et échangez des clés avec vos amis ou partenaires en quelques clics, avec un contrôle total et de la confidentialité.'
        },
        {
          title: 'Accès partout',
          desc: 'Votre collection est toujours disponible, que vous soyez sur ordinateur, tablette ou mobile.'
        },
        {
          title: 'Organisation et recherche',
          desc: 'Étiquetez, classez et recherchez vos clés pour un accès instantané et une meilleure gestion.'
        },
        {
          title: 'Import en un clic',
          desc: 'Importez rapidement des clés depuis des bundles, emails ou fichiers CSV.'
        },
        {
          title: 'Partage sécurisé',
          desc: 'Générez des liens sécurisés et limités dans le temps pour partager vos clés en toute sécurité.'
        }
      ],
      discoverTitle: 'Échanger, stocker et accéder partout',
      discoverDesc: 'Avec SteamKeyVault, vos clés sont toujours à portée de main. Échangez en toute sécurité, stockez en confiance et accédez à votre collection depuis n\'importe quel appareil.',
      discoverFeatures: [
        {
          title: 'Échange en confiance',
          desc: 'Escrow intégré et trace d\'audit pour chaque échange.'
        },
        {
          title: 'Stockage sécurisé',
          desc: 'Toutes les clés sont protégées par un chiffrement de niveau industriel.'
        },
        {
          title: 'Accès partout',
          desc: 'Votre coffre est disponible à tout moment, sur n\'importe quel appareil.'
        }
      ],
      faqTitle: 'Questions fréquentes',
      faqs: [
        {
          q: 'Quel est le niveau de sécurité de SteamKeyVault ?',
          a: 'Toutes les clés sont chiffrées de bout en bout. Vous seul possédez la clé de déchiffrement, même nous ne pouvons pas voir vos clés.'
        },
        {
          q: 'Puis-je échanger des clés avec d\'autres personnes ?',
          a: 'Oui ! Vous pouvez échanger ou partager des clés avec n\'importe qui, même sans compte SteamKeyVault.'
        },
        {
          q: 'Comment importer mes clés existantes ?',
          a: 'Utilisez notre outil d\'import en un clic pour ajouter des clés depuis des bundles, emails ou fichiers CSV.'
        },
        {
          q: 'SteamKeyVault est-il gratuit ?',
          a: 'Vous pouvez commencer gratuitement. Des fonctionnalités premium sont disponibles pour les utilisateurs avancés et les traders.'
        }
      ]
    },
    about: {
      title: 'À propos',
      body: 'Ceci est une page à propos'
    },
    docs: {
      eyebrow: 'Guide utilisateur',
      title: 'Documentation SteamKeyVault',
      subtitle: 'Un guide simple pour protéger vos clés, gérer votre bibliothèque et partager en toute confiance.',
      quickAccess: 'Accès rapide',
      toc: {
        encryption: 'Chiffrement et avantages',
        importExport: 'Import et export',
        sharing: 'Partager une clé par lien',
        customVsSteam: 'Jeux personnalisés vs Steam',
        lestrades: 'Export lestrades.com',
        deleteUsed: 'Supprimer les clés utilisées',
        qa: 'Questions / réponses'
      },
      encryption: {
        title: 'Chiffrement et avantages',
        body: 'Vos clés sont chiffrées dans votre navigateur avant d\'être envoyées au serveur. Cela signifie que vous seul pouvez voir les clés en clair lorsque vous êtes connecté.',
        whyTitle: 'Pourquoi cela vous protège',
        whyList: [
          'Vos clés sont illisibles pour toute personne qui ne possède pas votre session.',
          'Si une sauvegarde ou un snapshot de base fuit, les clés restent protégées.',
          'Les exports sont déchiffrés uniquement sur votre appareil, juste avant le téléchargement.'
        ],
        expectTitle: 'Ce que vous pouvez attendre',
        expectList: [
          'Après déconnexion ou nettoyage du navigateur, vous devez vous reconnecter pour voir les clés.',
          'Les imports sont protégés localement avant l\'envoi, vos données restent privées.'
        ]
      },
      importExport: {
        title: 'Import et export',
        managePrefix: 'Vous pouvez gérer les imports et exports depuis',
        manageMiddle: 'et la page',
        manageSuffix: '.',
        csvImportTitle: 'Import CSV ou TXT',
        csvImportSteps: [
          'Ouvrez la page Import.',
          'Déposez votre fichier ou cliquez sur Sélectionner un fichier.',
          'Format attendu : gameName;key1;key2 (une ligne par jeu).',
          'Un panneau de progression affiche les résultats et erreurs.'
        ],
        csvImportNote: 'Taille de fichier max : 10 Mo.',
        csvExportTitle: 'Export CSV',
        csvExportSteps: [
          'Dans Mon compte, cliquez sur Export CSV.',
          'Votre fichier est préparé et déchiffré localement sur votre appareil.'
        ],
        jsonTitle: 'Import ou export JSON (SteamKeyVault)',
        jsonItems: [
          'L\'export JSON conserve la structure SteamKeyVault pour un ré-import facile.',
          'L\'import JSON chiffre les clés localement avant envoi.'
        ]
      },
      sharing: {
        title: 'Partager une clé par lien',
        body: 'Vous pouvez générer un lien temporaire pour n\'importe quelle clé et l\'envoyer. Le destinataire révèle la clé sur une page publique.',
        createTitle: 'Créer un lien',
        createSteps: [
          'Ouvrez Mes clés.',
          'Cliquez sur l\'icone de partage d\'une clé.',
          'Copiez le lien et envoyez-le.'
        ],
        behaviorTitle: 'Fonctionnement',
        behaviorList: [
          'Le lien a une date d\'expiration.',
          'La clé ne peut être révélée qu\'une seule fois.',
          'Un captcha protège la clé des robots.',
          'Vous pouvez désactiver le lien depuis la fenêtre de partage.'
        ]
      },
      customVsSteam: {
        title: 'Jeux personnalisés vs jeux Steam',
        body: 'SteamKeyVault prend en charge les jeux liés à Steam et les jeux personnalisés qui ne sont pas sur Steam.',
        steamTitle: 'Jeux Steam',
        steamList: [
          'Liés à un App ID Steam.',
          'Titre, images et éditeur remplis automatiquement.'
        ],
        customTitle: 'Jeux personnalisés',
        customList: [
          'Créez un jeu avec le nom que vous voulez.',
          'Vous pourrez ensuite le lier à un jeu Steam.',
          'Si un App ID Steam devient invalide, le jeu reste personnalisé.'
        ]
      },
      lestrades: {
        title: 'Export lestrades.com',
        body: 'Cet export crée un format texte que vous pouvez coller directement dans lestrades.com.',
        whereTitle: 'Où le trouver',
        whereSteps: [
          'Ouvrez Mes clés.',
          'Cliquez sur le menu à trois points en haut de la colonne des jeux.',
          'Sélectionnez Export pour lestrades.com.'
        ],
        formatTitle: 'Format',
        formatList: [
          'Un jeu par ligne.',
          'Jeu Steam : GameName/steamAppId.',
          'Jeu personnalise : GameName.',
          'Le résultat est copié dans votre presse-papiers.'
        ]
      },
      deleteUsed: {
        title: 'Supprimer les clés utilisées',
        body: 'Vous pouvez supprimer toutes les clés marquées comme utilisées en une seule action.',
        stepsTitle: 'Étapes',
        steps: [
          'Ouvrez Mes clés.',
          'Ouvrez le menu à trois points dans la colonne des jeux.',
          'Choisissez Supprimer toutes les clés utilisées et confirmez.'
        ],
        note: 'Cette action est irréversible.'
      },
      qa: {
        title: 'Questions / réponses',
        items: [
          {
            q: 'Stockez-vous mes clés en clair ?',
            a: 'Non. Vos clés sont chiffrées avant de quitter votre appareil.'
          },
          {
            q: 'Puis-je partager une clé en toute sécurité ?',
            a: 'Oui. Les liens de partage sont temporaires, peuvent être désactivés et ne permettent qu\'une seule révélation.'
          },
          {
            q: 'Que se passe-t-il si un jeu Steam est retiré ?',
            a: 'Le jeu reste dans votre bibliothèque comme jeu personnalisé, vous ne perdez pas vos données.'
          },
          {
            q: 'Puis-je déplacer ma bibliothèque vers un autre compte ?',
            a: 'Oui. Exportez vos données et importez-les dans un autre compte quand vous voulez.'
          }
        ]
      }
    },
    account: {
      title: 'Mon compte',
      stats: {
        totalGames: 'Jeux au total',
        totalKeys: 'Clés au total',
        accountStatus: 'Statut du compte',
        verified: 'Vérifié',
        unverified: 'Non vérifié'
      },
      data: {
        title: 'Gestion des données',
        desc: 'Importez ou exportez les données de votre bibliothèque de jeux. Le CSV contient les noms des jeux et les clés séparées par des points-virgules. Le JSON suit le schéma SteamKeyVault.',
        importCsv: 'Importer CSV',
        exportCsv: 'Exporter CSV',
        importJson: 'Importer JSON (SteamKeyVault)',
        exportJson: 'Exporter JSON (SteamKeyVault)'
      },
      email: {
        title: 'Paramètres email',
        desc: 'Gérez votre adresse email et la vérification.',
        label: 'Adresse email',
        placeholder: 'votre@email.com',
        invalid: 'Veuillez saisir une adresse email valide.',
        pending: 'Changement en attente. Vérifiez {email} pour confirmer.',
        unverified: 'Veuillez vérifier votre boîte mail pour valider votre email.',
        resend: 'Renvoyer l\'email'
      },
      security: {
        title: 'Sécurité',
        desc: 'Mettez à jour votre mot de passe pour sécuriser votre compte.',
        currentPassword: 'Mot de passe actuel',
        newPassword: 'Nouveau mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        updatePassword: 'Mettre à jour le mot de passe',
        passwordRequirements: "Le mot de passe doit : contenir au moins 12 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial (#?!@$%^&*-'+()_[])"
      },
      preferences: {
        title: 'Préférences',
        desc: 'Ajustez vos préférences de compte.',
        language: 'Langue'
      },
      toasts: {
        confirmationRequired: 'Confirmation requise',
        emailUpdateRequested: 'Demande de changement d\'email envoyée',
        success: 'Succès',
        failedUpdateEmail: "Échec de la mise à jour de l\'email",
        invalidData: 'Données invalides',
        checkPasswordFields: 'Veuillez vérifier les champs du mot de passe',
        invalidPassword: 'Mot de passe invalide',
        passwordChanged: 'Mot de passe modifié',
        passwordUpdateFailed: 'Échec de la mise à jour du mot de passe',
        missingEncryptionContext: 'Contexte de chiffrement manquant. Veuillez vous reconnecter.',
        failedAccountStats: 'Échec du chargement des statistiques du compte',
        emailSent: 'Email envoyé',
        verificationResent: 'Email de vérification renvoyé.',
        failedResendEmail: "Échec de l\'envoi de l\'email",
        export: 'Export',
        csvDownloaded: 'CSV téléchargé : {filename}',
        jsonDownloaded: 'JSON téléchargé : {filename}',
        fileTooLarge: 'Fichier trop volumineux',
        maxFileSize: 'Taille max du fichier : 10 Mo.',
        importJson: 'Import JSON',
        gamesKeysCreated: 'Jeux créés : {games}, clés créées : {keys}',
        failedImportJson: "Échec de l\'import JSON"
      }
    },
    auth: {
      login: {
        title: 'Connexion',
        email: 'Email',
        password: 'Mot de passe',
        submit: 'Connexion',
        forgot: 'Mot de passe oublié ?',
        noAccount: "Pas de compte ?",
        register: 'Inscription'
      },
      register: {
        title: 'Inscription',
        email: 'Email',
        username: "Nom d'utilisateur",
        password: 'Mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        submit: 'Inscription',
        hasAccount: 'Vous avez déjà un compte ?',
        login: 'Connexion',
        passwordRequirements: "Le mot de passe doit : contenir au moins 12 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial (#?!@$%^&*-'+()_[])",
        errors: {
          passwordMismatch: 'Les mots de passe ne correspondent pas.',
          registrationFailed: "Échec de l'inscription."
        },
        success: "Inscription réussie ! Veuillez sauvegarder votre phrase de récupération."
      },
      recovery: {
        title: 'Clé de récupération',
        warning: 'Sauvegardez cette phrase de récupération maintenant. C\'est le seul moyen de récupérer vos données si vous oubliez votre mot de passe.',
        copy: 'Copier',
        saved: 'Je l\'ai enregistré',
        copied: 'Copie',
        copiedDetail: 'Phrase de récupération copiée',
        copyFailed: 'Échec de la copie de la phrase de récupération'
      },
      forgot: {
        title: 'Mot de passe oublié',
        sendLink: 'Envoyer le lien de réinitialisation',
        success: 'Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.',
        emailSent: 'Email envoyé',
        emailSentDetail: 'Si le compte existe, un lien de réinitialisation a été envoyé.',
        resetFailed: 'Réinitialisation échouée',
        failedToSend: "Échec de l'envoi de l'email de réinitialisation."
      },
      reset: {
        title: 'Réinitialiser le mot de passe',
        validating: 'Validation du lien de réinitialisation...',
        recoveryPhrase: 'Phrase de récupération',
        recoveryPlaceholder: 'douze mots',
        newPassword: 'Nouveau mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        submit: 'Réinitialiser le mot de passe',
        success: 'Mot de passe réinitialisé. Vous pouvez vous connecter maintenant.',
        resetToastTitle: 'Mot de passe réinitialisé',
        resetToastDetail: 'Vous pouvez vous connecter avec votre nouveau mot de passe.',
        failed: 'Échec de la réinitialisation du mot de passe.',
        invalidLink: 'Lien de réinitialisation invalide.',
        invalidOrExpired: 'Lien de réinitialisation invalide ou expiré.'
      },
      verify: {
        verifyingTitle: 'Vérification de votre email...',
        verifyingDesc: 'Veuillez patienter pendant la vérification de votre adresse email.',
        successTitle: 'Email vérifié !',
        successDesc: 'Vous pouvez maintenant vous connecter à votre compte.',
        goToLogin: 'Aller à la connexion',
        failedTitle: 'Vérification échouée',
        failedDefault: 'Une erreur est survenue pendant la vérification.',
        noToken: 'Aucun jeton de vérification fourni.',
        invalidLink: 'Lien de vérification invalide ou expiré.',
        successFallback: 'Email vérifié avec succès !'
      },
      confirmEmail: {
        confirmingTitle: 'Confirmation du changement d\'email...',
        confirmingDesc: 'Veuillez patienter pendant la mise à jour de votre adresse email.',
        successTitle: 'Email modifié !',
        successDesc: 'Votre adresse email a été mise à jour avec succès.',
        failedTitle: 'Confirmation échouée',
        failedDefault: 'Une erreur est survenue pendant la confirmation.',
        noToken: 'Aucun jeton de confirmation fourni.',
        invalidLink: 'Lien de confirmation invalide ou expiré.',
        successFallback: 'Adresse email modifiée avec succès !',
        goToAccount: 'Aller à Mon compte'
      }
    },
    myKeys: {
      yourGames: 'Vos jeux',
      moreActions: 'Plus d\'actions',
      exportLestrades: 'Exporter pour lestrades.com',
      deleteAllUsed: 'Supprimer toutes les clés utilisées',
      emptyTitle: 'Aucun jeu sélectionné',
      emptyDesc: 'Sélectionnez un jeu dans la barre latérale pour voir les détails et gérer les clés.',
      deleteAllHeader: 'Supprimer toutes les clés utilisées',
      deleteAllMessage: 'Êtes-vous sûr de vouloir supprimer toutes les clés utilisées de tous vos jeux ? Cette action est irréversible.',
      deleteAllCancel: 'Annuler',
      deleteAllConfirm: 'Supprimer',
      deleteAllSuccess: 'Clés supprimées',
      deleteAllCount: '{count} clé{suffix} supprimée{suffix}',
      deleteAllFailed: 'Échec de la suppression des clés utilisées',
      clipboardCopied: 'Copié',
      exportCopied: 'Export copié dans le presse-papiers',
      exportCopyFailed: 'Échec de la copie de l\'export'
    },
    games: {
      filterPlaceholder: 'Filtrer les jeux...',
      noGamesFound: 'Aucun jeu trouvé.',
      addGame: 'Ajouter un jeu',
      addGameHeader: 'Ajouter un jeu',
      addCustomLabel: 'Ajouter un jeu non-Steam / personnalisé',
      searchSteamPlaceholder: 'Rechercher un jeu Steam...',
      manualNamePlaceholder: 'Entrez le nom du jeu',
      preview: 'Aperçu :',
      newCustomGame: 'Nouveau jeu personnalisé',
      appId: 'App ID : {id}',
      customGame: 'Jeu personnalisé',
      convertHeader: 'Associer à un jeu Steam',
      convertDesc: 'Recherchez la version Steam de ce jeu pour activer des fonctions d\'intégration comme les images et les liens.',
      selectedGame: 'Jeu sélectionné :',
      convertAction: 'Convertir',
      confirmDelete: 'Confirmer la suppression',
      deleteWarning: 'Ce jeu a des clés associées. Le supprimer supprimera aussi définitivement toutes ses clés.',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer ce jeu ?',
      customPublisher: 'Jeu personnalisé',
      removedFromSteam: 'Retiré de Steam',
      matchSteam: 'Associer à un jeu Steam',
      deleteGameTooltip: 'Supprimer le jeu de la bibliothèque',
      steamRemovedMessage: "Ce jeu a été retiré du store Steam ou l'App ID est invalide."
      ,
      deleteFailed: 'Suppression échouée',
      deleteFailedDetail: 'Échec de la suppression du jeu',
      deleteSuccess: 'Supprimé',
      deleteSuccessDetail: 'Jeu supprimé',
      deleteUnknownId: "Impossible de déterminer l'id du jeu",
      placeholderAlt: 'Emplacement du jeu'
    },
    gameInfo: {
      loading: 'Chargement...',
      unavailable: 'Détails du jeu indisponibles.',
      byPublisher: 'par {publisher}',
      metascore: 'Métascore {score}',
      viewCards: 'Voir les cartes à échanger sur le marché Steam',
      viewAchievements: 'Voir les succès sur Steam',
      viewSteamStore: 'Voir sur le Steam Store',
      viewSteamDb: 'Voir sur SteamDB',
      freeToPlay: 'Gratuit',
      commandCopied: 'Commande copiée',
      commandCopiedDetail: 'La commande ASF a été copiée dans le presse-papiers',
      copyFailed: 'Copie échouée',
      copyFailedDetail: 'Échec de la copie dans le presse-papiers'
    },
    keys: {
      addKey: 'Ajouter une clé',
      selectGameFirst: 'Veuillez d\'abord sélectionner un jeu',
      emptyTitle: 'Aucune clé trouvée. Ajoutez une clé pour commencer.',
      columnKey: 'Clé',
      columnDateAdded: 'Date d\'ajout',
      columnUsage: 'Usage',
      columnStatus: 'Statut',
      columnActions: 'Actions',
      statusSharing: 'Partage',
      statusUsed: 'Utilisée',
      statusAvailable: 'Disponible',
      actionCopyKey: 'Copier la clé',
      actionShare: 'Partager',
      actionKeyUsed: 'Clé déjà utilisée',
      actionEdit: 'Modifier',
      actionDelete: 'Supprimer',
      addDialogTitle: 'Ajouter une clé',
      editDialogTitle: 'Modifier une clé',
      deleteDialogTitle: 'Confirmer la suppression',
      shareDialogTitle: 'Partager une clé',
      keyLabel: 'Clé',
      keyPlaceholder: 'XXXXX-XXXXX-XXXXX',
      usageOptional: 'Usage (optionnel)',
      usageLabel: 'Usage',
      usagePlaceholder: 'Sélectionner un usage',
      markUsed: 'Marquer comme utilisée',
      saveChanges: 'Enregistrer les modifications',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cette clé ? Cette action est irréversible.',
      shareLink: 'Lien de partage',
      expiresOn: 'Expire le {date}',
      disableLink: 'Désactiver le lien',
      copyLink: 'Copier le lien',
      linkDisabled: 'Lien désactivé',
      linkDisabledDetail: 'Le lien de partage a été désactivé',
      shareCopied: 'Lien de partage copié dans le presse-papiers',
      keyCopied: 'Clé copiée dans le presse-papiers',
      copyFailed: 'Échec de la copie de la clé',
      copyShareFailed: 'Échec de la copie du lien de partage',
      disableFailed: 'Échec de la désactivation du lien de partage',
      currentUse: {
        keep: 'Garder',
        trade: 'Échanger',
        giveaway: 'Donner',
        sell: 'Vendre',
        other: 'Autre'
      }
    },
    import: {
      title: 'Importer des jeux',
      backToAccount: 'Retour au compte',
      uploadTitle: 'Téléverser un fichier CSV',
      uploadDesc: 'Importez votre bibliothèque de jeux avec un fichier CSV ou TXT.',
      format: 'Format : gameName;key1;key2',
      dropText: 'Déposez votre fichier CSV ici ou cliquez pour parcourir',
      selectFile: 'Sélectionner un fichier',
      progressTitle: "Progression de l'import",
      processing: 'Traitement...',
      results: 'Résultats',
      keysAdded: '{count} clés ajoutées',
      status: {
        pending: 'en attente',
        processing: 'en cours',
        completed: 'terminé',
        failed: 'échoué'
      },
      fileTooLarge: 'Fichier trop volumineux',
      maxFileSize: 'Taille max du fichier : 10 Mo.',
      upload: 'Téléversement',
      uploadStarted: 'Fichier téléversé, traitement lancé',
      error: 'Erreur'
    },
    share: {
      loadingKey: 'Chargement de la clé...',
      offerTitle: '{donor} vous propose une clé pour {game}',
      validUntil: 'Lien valable jusqu\'au {date}',
      expired: 'Ce lien a expiré.',
      revealed: 'Ce lien a déjà été utilisé.',
      used: 'Cette clé est déjà marquée comme utilisée.',
      promo: 'Cette clé a été partagée via SteamKeyVault — gérez et partagez vos clés en toute sécurité.',
      createAccount: 'Créer un compte',
      revealedKey: 'Clé révélée',
      activateSteam: 'Activer sur Steam',
      revealKey: 'Révéler la clé',
      captchaMissing: "Le captcha Turnstile n'est pas configuré.",
      sendMessageTitle: 'Envoyer un message au donateur',
      messagePlaceholder: 'Écrivez un message de remerciement...',
      sendMessage: 'Envoyer le message',
      captcha: 'Captcha',
      captchaRequired: 'Veuillez compléter le captcha.',
      keyRevealed: 'Clé révélée',
      keyRevealedDetail: 'La clé est maintenant visible.',
      invalidLink: 'Lien invalide.',
      revealFailed: 'Impossible de révéler la clé.',
      messageTooLong: 'Le message doit faire 100 caractères ou moins.',
      sent: 'Envoyé',
      messageSent: 'Message envoyé au donateur.',
      sendFailed: 'Impossible d\'envoyer le message.',
      copied: 'Copié',
      copiedDetail: 'Clé copiée.',
      copyFailed: 'Impossible de copier la clé.'
    },
    admin: {
      dashboardTitle: 'Tableau de bord admin',
      statsFailed: 'Échec du chargement des statistiques admin',
      stats: {
        totalUsers: 'Utilisateurs au total',
        verifiedUsers: 'Utilisateurs vérifiés',
        adminUsers: 'Utilisateurs admin',
        totalGames: 'Jeux au total',
        totalKeys: 'Clés au total'
      },
      sections: {
        userManagement: 'Gestion des utilisateurs',
        userManagementDesc: 'Gérer les comptes, emails et permissions',
        steamSync: 'Synchronisation Steam',
        steamSyncDesc: 'Rafraîchir la base Steam et voir les statistiques',
        actionLogs: 'Journaux d\'actions',
        actionLogsDesc: 'Vérifier les connexions et changements de compte avec filtres'
      },
      users: {
        title: 'Gestion des utilisateurs',
        backToDashboard: 'Retour au tableau de bord',
        id: 'ID',
        username: "Nom d'utilisateur",
        email: 'Email',
        verified: 'Vérifié',
        admin: 'Admin',
        games: 'Jeux',
        keys: 'Clés',
        joined: 'Inscrit',
        actions: 'Actions',
        editUser: 'Modifier un utilisateur',
        newPasswordHint: 'Nouveau mot de passe (laisser vide pour conserver)',
        adminPrivileges: 'Privilèges admin',
        saveChanges: 'Enregistrer les modifications',
        confirmDelete: 'Confirmer la suppression',
        confirmClear: 'Confirmer le nettoyage',
        deleteUserPrompt: 'Êtes-vous sûr de vouloir supprimer l\'utilisateur {username} ? Cette action est irréversible.',
        clearUserPrompt: 'Cela supprimera tous les jeux et clés de {username}. Le compte restera actif.',
        deleteGamesKeys: 'Supprimer jeux et clés',
        userUpdated: 'Utilisateur mis à jour',
        userDeleted: 'Utilisateur supprimé',
        failedLoadUsers: 'Échec du chargement des utilisateurs',
        failedUpdateUser: 'Échec de la mise à jour de l\'utilisateur',
        failedDeleteUser: "Échec de la suppression de l\'utilisateur",
        failedDeleteGamesKeys: 'Échec de la suppression des jeux et clés',
        deletedGamesKeys: '{games} jeux et {keys} clés supprimés.',
        deletedGamesKeysFallback: 'Jeux et clés supprimés.'
      },
      logs: {
        title: 'Journaux des actions utilisateur',
        refresh: 'Actualiser',
        start: 'Début',
        end: 'Fin',
        action: 'Action',
        userSearch: 'Recherche utilisateur',
        userSearchPlaceholder: 'Email ou nom d\'utilisateur',
        apply: 'Appliquer',
        last24h: 'Dernières 24h',
        showingRange: 'Données du {start} au {end}',
        totalActions: 'Actions totales',
        logins: 'Connexions',
        passwordChanges: 'Changements de mot de passe',
        emailChanges: 'Changements d\'email',
        uniqueUsers: 'Utilisateurs uniques',
        allActions: 'Toutes les actions',
        results: '{count} résultats',
        time: 'Heure',
        user: 'Utilisateur',
        ip: 'IP',
        userAgent: 'Agent utilisateur',
        metadata: 'Métadonnées',
        allActionsOption: 'Toutes les actions',
        loginOption: 'Connexion',
        passwordChangeOption: 'Changer le mot de passe',
        emailChangeOption: "Changer l\'email",
        failedLoad: 'Échec du chargement des journaux'
      },
      steam: {
        title: 'Synchronisation Steam',
        statsTitle: 'Statistiques de la base Steam',
        totalApps: 'Total des apps Steam en base',
        totalUserGames: 'Total des jeux utilisateurs',
        uniqueGamesAdded: 'Jeux uniques ajoutés',
        actionsTitle: 'Actions de synchronisation',
        refreshTitle: 'Rafraîchir la base des apps Steam',
        refreshDesc: 'Récupère la liste la plus récente de toutes les applications Steam via l\'API et met à jour la base locale. Ce processus peut prendre plusieurs minutes.',
        refreshButton: 'Rafraîchir les apps Steam',
        refreshComplete: 'Rafraîchissement terminé',
        refreshSuccess: 'Rafraîchissement réussi de {count} apps Steam dans la base.',
        failedLoadStats: 'Échec du chargement des statistiques Steam',
        failedRefresh: 'Échec du rafraîchissement des apps Steam'
      }
    },
    validation: {
      password: {
        minLength: 'Le mot de passe doit contenir au moins 12 caractères',
        lowercase: 'Le mot de passe doit contenir au moins une minuscule',
        uppercase: 'Le mot de passe doit contenir au moins une majuscule',
        digit: 'Le mot de passe doit contenir au moins un chiffre',
        special: "Le mot de passe doit contenir au moins un caractère spécial (#?!@$%^&*-'+()_[])"
      }
    },
    errors: {
      missingMasterKey: 'Clé maître manquante',
      loginAgain: 'Veuillez vous reconnecter.'
    }
  }
}

function getBrowserLocale(): SupportedLocale {
  const raw = typeof navigator !== 'undefined' ? navigator.language : 'en'
  const base = raw ? raw.split('-')[0] : 'en'
  if (SUPPORTED_LOCALES.includes(base as SupportedLocale)) {
    return base as SupportedLocale
  }
  return 'en'
}

function getStoredLocale(): SupportedLocale | null {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored && SUPPORTED_LOCALES.includes(stored as SupportedLocale)) {
    return stored as SupportedLocale
  }
  return null
}

function applyDocumentLang(locale: SupportedLocale) {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale
  }
}

export function getInitialLocale(): SupportedLocale {
  const stored = getStoredLocale()
  const locale = stored || getBrowserLocale()
  applyDocumentLang(locale)
  return locale
}

export function setLocale(locale: SupportedLocale) {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  applyDocumentLang(locale)
  i18n.global.locale.value = locale
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages
})

export { SUPPORTED_LOCALES, LOCALE_STORAGE_KEY }
