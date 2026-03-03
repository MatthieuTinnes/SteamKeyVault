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
      eyebrow: 'Free to Use · Secure by Design · Privacy-Focused',
      heroTitle: 'Your Steam Keys, Safe and Organized',
      heroSubtitle: 'SteamKeyVault keeps your entire game key library encrypted, searchable, and shareable, all under your control.',
      getStarted: 'Get started free',
      learnMore: 'Learn More',
      viewDocs: 'Read the Docs',
      trustItems: [
        { icon: 'pi-lock', label: 'End-to-end encrypted' },
        { icon: 'pi-file-export', label: 'Full control of your data' },
        { icon: 'pi-eye-slash', label: 'Zero trackers' },
        { icon: 'pi-globe', label: 'Works on any device' }
      ],
      featuresTitle: 'Everything you need to manage your keys',
      featuresDesc: 'Built for collectors, traders, and gamers who care about privacy and control.',
      features: [
        {
          icon: 'pi-lock',
          title: 'End-to-End Encryption',
          desc: 'Your Steam keys are encrypted in your browser before they reach the server. Only you can read them.'
        },
        {
          icon: 'pi-arrow-right-arrow-left',
          title: 'Easy Key Sharing',
          desc: 'Generate a one-time, expiring link to share any key with anyone (no account required for the recipient).'
        },
        {
          icon: 'pi-file-export',
          title: 'Full Control of Your Data',
          desc: 'You can export your entire game and key library at any time.'
        },
        {
          icon: 'pi-tags',
          title: 'Organize & Search',
          desc: 'Filter by game, mark keys as used or for trade, and find any key instantly in your library.'
        },
        {
          icon: 'pi-upload',
          title: 'One-Click Import',
          desc: 'Import keys from CSV or TXT files in seconds. Perfect for Humble Bundle or Fanatical purchases.'
        },
        {
          icon: 'pi-link',
          title: 'Steam Integration',
          desc: 'Games are matched to Steam titles automatically (cover art, publisher info, and store links included).'
        }
      ],
      howItWorksTitle: 'Up and running in minutes',
      howItWorksDesc: 'No complicated setup. Add your keys, and SteamKeyVault handles the rest.',
      steps: [
        {
          number: '01',
          icon: 'pi-user-plus',
          title: 'Create your account',
          desc: 'Register in seconds. Your encryption keys are generated locally. We never see them.'
        },
        {
          number: '02',
          icon: 'pi-upload',
          title: 'Import your library',
          desc: 'Paste keys one by one, or bulk-import from a CSV file. Keys are encrypted before they leave your browser.'
        },
        {
          number: '03',
          icon: 'pi-share-alt',
          title: 'Organize and share',
          desc: 'Tag keys by intended use, generate share links, and keep your library clean by deleting used keys.'
        }
      ],
      securityTitle: 'Your keys belong to you',
      securityDesc: 'With SteamKeyVault, security and privacy are at the core of everything we do. Here\'s how we protect your valuable game keys:',
      securityPoints: [
        'Keys are encrypted in your browser using your login credentials before being sent to the server.',
        'The server stores only ciphertext. A database breach exposes nothing readable.',
        'Exports are decrypted on your device, never server-side.',
        'No analytics, no third-party SDKs, no trackers. Your data stays yours.'
      ],
      securityEyebrow: 'Security',
      securityCard: {
        label: 'Encrypted vault',
        browser: 'Your browser',
        server: 'Server',
        aes: 'AES-256',
        note: 'The server only receives ciphertext'
      },
      ctaTitle: 'Ready to secure your Steam library?',
      ctaDesc: 'Join SteamKeyVault today, free and built with privacy first.',
      ctaButton: 'Create your free vault',
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
          a: 'All keys are encrypted end-to-end in your browser. Only you have the decryption key. Not even the server admin can read your keys.'
        },
        {
          q: 'Can I share keys with people who don\'t have an account?',
          a: 'Yes. You generate a one-time link that reveals the key once, protected by a captcha. No account needed for the recipient.'
        },
        {
          q: 'How do I import my existing keys?',
          a: 'Use the CSV/TXT import, one line per game in the format gameName;key1;key2. Keys are encrypted locally before upload.'
        },
        {
          q: 'Is SteamKeyVault really free?',
          a: 'Yes. SteamKeyVault is completely free to use.'
        },
        {
          q: 'What happens to my keys if I lose my password?',
          a: 'At registration you receive a 12-word recovery phrase. Keep it safe, it\'s the only way to recover your encrypted data.'
        }
      ]
    },
    about: {
      title: 'About',
      body: 'This is an about page'
    },
    footer: {
      terms: 'Terms of Service',
      privacy: 'Privacy Policy'
    },
    legal: {
      title: 'Legal Notice',
      disclaimer: {
        title: 'Steam Trademark Disclaimer',
        body: 'SteamKeyVault is an independent personal project and is in no way affiliated with, authorized, endorsed, or sponsored by Valve Corporation or Steam.',
        trademark: 'Steam®, the Steam logo, and all related marks, emblems and logos are registered trademarks or trademarks of Valve Corporation in the United States and/or other countries. All other trademarks are the property of their respective owners.'
      },
      publisher: {
        title: 'Publisher',
        body: 'SteamKeyVault is a personal project developed and maintained independently. It is not a commercial entity.',
        nameLabel: 'Project name',
        contactLabel: 'Contact',
        contactValue: 'contact@steamkeyvault.com'
      },
      hosting: {
        title: 'Hosting',
        body: 'The SteamKeyVault service is hosted on a private server managed by the project maintainer.'
      },
      dataPrivacy: {
        title: 'Personal Data',
        body: 'SteamKeyVault collects only the minimum data necessary to operate the service (account credentials and encrypted game keys). No personal data is sold or shared with third parties. For full details, see the Privacy Policy.'
      },
      liability: {
        title: 'Limitation of Liability',
        body: 'SteamKeyVault is provided "as is", without any warranty. The project maintainer cannot be held responsible for any data loss, service interruption, or damages resulting from the use of this service.'
      }
    },
    terms: {
      title: 'Terms of Service',
      effectiveDate: 'Effective Date',
      s1: {
        title: 'Platform Information',
        body: 'SteamKeyVault is an independent project for securely storing, organizing, and sharing Steam game keys.',
        disclaimer: 'SteamKeyVault is not affiliated with, endorsed by, sponsored by, or officially connected to Valve Corporation or Steam in any way. Steam and the Steam logo are trademarks of Valve Corporation.'
      },
      s2: {
        title: 'Acceptance of Terms',
        body: 'By creating an account or using SteamKeyVault, you agree to these Terms of Service. The maintainers reserve the right to update these Terms at any time. Continued use of the service after changes constitutes acceptance of the revised Terms.'
      },
      s3: {
        title: 'User Accounts & Responsibilities',
        body: 'Users must create an account to access the full features of SteamKeyVault. By registering, you agree to:',
        i1: 'Provide accurate information and keep your account credentials secure.',
        i2: 'Be solely responsible for all activities conducted through your account.',
        i3: 'Notify the administrators immediately of any unauthorized use of your account.'
      },
      s4: {
        title: 'Usage Policies',
        body: 'You agree not to use SteamKeyVault for any unlawful purpose or in violation of these Terms. Prohibited activities include:',
        i1: 'Sharing, distributing, or trading keys obtained through unauthorized or illegal means.',
        i2: 'Attempting to reverse-engineer, disrupt, or abuse the service infrastructure.',
        i3: 'Impersonating other users or misrepresenting your affiliation with any entity.'
      },
      s5: {
        title: 'Steam Trademark Disclaimer',
        body: 'SteamKeyVault is an independent project and is in no way affiliated with, authorized, endorsed, or sponsored by Valve Corporation.',
        trademark: 'Steam®, the Steam logo, and all related marks, emblems and logos are registered trademarks or trademarks of Valve Corporation in the United States and/or other countries. All other trademarks are the property of their respective owners.'
      },
      s6: {
        title: 'Intellectual Property',
        body: 'The SteamKeyVault name, design, and infrastructure remain the property of the project maintainers. Users retain full ownership of the data they upload.'
      },
      s7: {
        title: 'Limitation of Liability',
        body: 'SteamKeyVault is provided "as is" without warranties of any kind, either express or implied. The project maintainers are not liable for any direct, indirect, incidental, or consequential damages resulting from the use of or inability to use the service, including loss of keys or account data.'
      },
      s8: {
        title: 'Account Termination',
        body: 'You may delete your account at any time from your account settings. The maintainers reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or pose a risk to the security of the service or other users. Upon termination, your data will be permanently deleted within 30 days.'
      },
      s9: {
        title: 'Contact',
        body: 'For any questions or concerns regarding these Terms, please contact the project maintainer directly.'
      }
    },
    privacy: {
      title: 'Privacy Policy',
      effectiveDate: 'Effective Date',
      s1: {
        title: 'Information We Collect',
        body: 'SteamKeyVault collects only the minimum data required to operate the service:',
        i1: 'Account information: username, email address, and hashed password.',
        i2: 'Game keys: stored encrypted. Your keys are encrypted client-side before being sent to the server.',
        i3: 'Session data: a session cookie used for authentication.'
      },
      s2: {
        title: 'Purpose of Data Collection',
        body: 'We collect data solely to:',
        i1: 'Provide, operate, and maintain the SteamKeyVault service.',
        i2: 'Authenticate users and protect accounts.',
        i3: 'Enable key sharing features between users.'
      },
      s3: {
        title: 'Data Storage & Security',
        body: 'SteamKeyVault employs several layers of protection to keep your data safe:',
        i1: 'Client-side encryption: your game keys are encrypted in your browser before being stored. The server never sees plaintext keys.',
        i2: 'Transit security: all communications are protected via TLS/HTTPS.',
        i3: 'Access control: only authenticated users can access their own data.'
      },
      s4: {
        title: 'Data Sharing & Third Parties',
        body: 'SteamKeyVault does not sell, rent, or share your personal data with any third party for marketing or commercial purposes. No analytics trackers or advertising services are embedded. Data sharing is limited to the server infrastructure used to run the service.'
      },
      s5: {
        title: 'Your Rights (GDPR)',
        body: 'If you are located in the European Union, you have the following rights regarding your personal data:',
        i1: 'Right of Access: request a copy of the personal data we hold about you.',
        i2: 'Right to Rectification: correct inaccurate or incomplete data via your account settings.',
        i3: 'Right to Erasure: request deletion of your account and all associated data.',
        i4: 'Right to Data Portability: export your data at any time from your account settings.'
      },
      s6: {
        title: 'Data Retention',
        body: 'We retain your data only as long as your account is active:',
        i1: 'Active accounts: data is retained while your account remains active.',
        i2: 'Deleted accounts: upon account deletion, all user data is permanently removed within 30 days.',
        i3: 'Backups: backup copies may be retained for up to 90 days after deletion for disaster-recovery purposes.'
      },
      s7: {
        title: 'Changes to This Policy',
        body: 'We may update this Privacy Policy from time to time. When we do, we will update the effective date at the top of this page. We encourage you to review this policy periodically. Continued use of the service after changes indicates acceptance of the updated policy.'
      }
    },
    docs: {
      eyebrow: 'User guide',
      title: 'SteamKeyVault Documentation',
      subtitle: 'Everything you need to protect your keys, manage your library, and share with confidence.',
      quickAccess: 'On this page',
      toc: {
        gettingStarted: 'Getting started',
        encryption: 'Encryption & security',
        managingLibrary: 'Managing your library',
        importExport: 'Import & export',
        sharing: 'Share a key by link',
        customVsSteam: 'Custom vs Steam games',
        lestrades: 'lestrades.com export',
        deleteUsed: 'Delete used keys',
        accountSettings: 'Account & settings',
        qa: 'Q&A'
      },
      gettingStarted: {
        title: 'Getting started',
        body: 'Create a free account to start adding your Steam keys. The entire setup takes under a minute.',
        registerTitle: 'Create your account',
        registerSteps: [
          'Go to the Register page.',
          'Enter your email, a username, and a strong password (12+ characters).',
          'Submit the form. A 12-word recovery phrase appears immediately.',
          'Copy and save this phrase somewhere safe before closing the dialog.',
          'Verify your email by clicking the link sent to your inbox.'
        ],
        recoveryPhraseTitle: 'Your recovery phrase, keep it safe',
        recoveryPhraseBody: 'The recovery phrase is the only way to reset your password and recover your encrypted data. Without it, a forgotten password means permanent data loss.',
        recoveryPhraseList: [
          'Generated locally in your browser, never transmitted to the server.',
          'Write it down or store it in a password manager.',
          'Keep it separate from your account password.',
          'Never share it with anyone, including support.'
        ]
      },
      encryption: {
        title: 'Encryption & security',
        body: 'Your keys are encrypted in your browser before they are sent to the server. Only you can see them in plain text when logged in. Not even the server administrator can read them.',
        whyTitle: 'Why this protects you',
        whyList: [
          'Keys are unreadable to anyone without your active login session.',
          'A leaked database backup or snapshot exposes only ciphertext.',
          'Exports are decrypted on your device only, right before download.',
          'Password changes automatically re-encrypt all your data with the new key.'
        ],
        expectTitle: 'What to expect as a user',
        expectList: [
          'After logout or clearing your browser session, you must log in again to see keys.',
          'Imports are encrypted locally before upload. Your data never travels unprotected.'
        ]
      },
      managingLibrary: {
        title: 'Managing your library',
        body: 'All your games and keys live in My Keys. The left column lists your games; the right shows the keys for the selected game.',
        addGameTitle: 'Adding a game',
        addGameSteps: [
          'Open My Keys.',
          'Click the + button at the top of the games column.',
          'Search for a Steam title or type a custom name.',
          'Confirm to add it to your library.'
        ],
        addKeyTitle: 'Adding a key',
        addKeySteps: [
          'Select a game in the left column.',
          'Click Add Key in the key table.',
          'Paste the key value.',
          'The key is encrypted locally before being saved.'
        ],
        statusesTitle: 'Key statuses',
        statusesBody: 'Each key has one of three states:',
        statuses: [
          { name: 'Available', desc: 'The key has not been shared or used yet.' },
          { name: 'Sharing', desc: 'An active share link exists for this key. It will be marked Used once the recipient reveals it.' },
          { name: 'Used', desc: 'The key has been revealed via a share link or manually marked as used.' }
        ],
        convertTitle: 'Converting a custom game to a Steam game',
        convertSteps: [
          'Select the custom game in My Keys.',
          'Open the game actions menu (three dots).',
          'Choose Convert to Steam game.',
          'Search for the matching Steam title and confirm.'
        ]
      },
      importExport: {
        title: 'Import & export',
        managePrefix: 'You can manage imports and exports from',
        manageMiddle: 'and the',
        manageSuffix: 'page.',
        csvImportTitle: 'CSV or TXT import',
        csvImportSteps: [
          'Open the Import page.',
          'Drop your file or click Select File.',
          'Each line must follow the format: gameName;key1;key2',
          'A progress panel shows results and any errors per game.'
        ],
        csvImportNote: 'Max file size: 10 MB. Keys are encrypted locally before upload.',
        csvExportTitle: 'CSV export',
        csvExportSteps: [
          'Open My Account.',
          'Click Export CSV in the Data Management section.',
          'Your file is decrypted locally on your device before download.'
        ],
        jsonTitle: 'JSON import / export (SteamKeyVault format)',
        jsonItems: [
          'JSON export preserves the SteamKeyVault structure for easy re-import.',
          'JSON import encrypts all keys locally before upload.',
          'Use JSON for full backups when migrating to a new instance.'
        ]
      },
      sharing: {
        title: 'Share a key by link',
        body: 'Generate a temporary, one-time link for any key and send it to someone. The recipient reveals the key on a public page (no account needed).',
        createTitle: 'Create a share link',
        createSteps: [
          'Open My Keys.',
          'Click the share icon on the key you want to share.',
          'Set an expiration date if needed.',
          'Copy the link and send it to the recipient.'
        ],
        behaviorTitle: 'How share links work',
        behaviorList: [
          'Each link can be used only once. The key is revealed exactly one time.',
          'A captcha protects against automated bots.',
          'The recipient can send you a short message after revealing the key.',
          'You can revoke any active link from the share dialog at any time.',
          'Once revealed, the key is automatically marked as Used in your vault.'
        ]
      },
      customVsSteam: {
        title: 'Custom games vs Steam games',
        body: 'SteamKeyVault supports both Steam-linked games (with automatic metadata) and fully custom games for titles not on Steam.',
        steamTitle: 'Steam games',
        steamList: [
          'Linked to a Steam App ID.',
          'Title, cover art, publisher, and store link are filled automatically.',
          'If the App ID becomes invalid, the game is kept as a custom game.'
        ],
        customTitle: 'Custom games',
        customList: [
          'Create a game with any name (no Steam App ID required).',
          'You can convert it to a Steam game later once you find the App ID.',
          'Useful for GOG, Epic, Ubisoft Connect, and other platform keys.'
        ]
      },
      lestrades: {
        title: 'lestrades.com export',
        body: 'Generate a text block you can paste directly into lestrades.com to list your available keys for trading.',
        whereTitle: 'Where to find it',
        whereSteps: [
          'Open My Keys.',
          'Click the three dots menu at the top of the games column.',
          'Select Export for lestrades.com.'
        ],
        formatTitle: 'Format details',
        formatList: [
          'One game per line.',
          'Steam game format: GameName/steamAppId',
          'Custom game format: GameName (no App ID appended)',
          'Only games with at least one Available key are included.',
          'The result is copied directly to your clipboard.'
        ]
      },
      deleteUsed: {
        title: 'Delete used keys',
        body: 'Remove all keys marked as used across your entire library in a single bulk action.',
        stepsTitle: 'Steps',
        steps: [
          'Open My Keys.',
          'Click the three dots menu at the top of the games column.',
          'Choose Delete all used keys.',
          'Confirm the action in the dialog.'
        ],
        note: 'This action is permanent and cannot be undone.'
      },
      accountSettings: {
        title: 'Account & settings',
        body: 'Manage your profile, security, and preferences from My Account.',
        passwordTitle: 'Changing your password',
        passwordBody: 'Changing your password re-derives the encryption key. All your keys are automatically re-encrypted with the new password. You do not need to re-import anything.',
        passwordSteps: [
          'Open My Account.',
          'Scroll to the Security section.',
          'Enter your current password, then the new password.',
          'Click Update Password.'
        ],
        passwordNote: 'Minimum 12 characters, with at least one lowercase letter, uppercase letter, digit, and special character.',
        emailTitle: 'Updating your email address',
        emailSteps: [
          'Open My Account.',
          'Enter the new address in the Email Settings section.',
          'A confirmation link is sent to the new address.',
          'Click the link in your inbox to complete the change.'
        ],
        markdownTitle: 'Markdown export',
        markdownBody: 'Creates a formatted Markdown list of your Steam games with links to their store pages, useful for posts, forums, or external tracking.',
        markdownSteps: [
          'Open My Keys.',
          'Click the three dots menu at the top of the games column.',
          'Select Export as Markdown.',
          'The result is copied to your clipboard.'
        ]
      },
      qa: {
        title: 'Q&A',
        items: [
          {
            q: 'Do you store my keys in plain text?',
            a: 'No. Keys are encrypted in your browser before being sent to the server. The server stores only ciphertext and cannot read your keys.'
          },
          {
            q: 'What if I lose my recovery phrase?',
            a: 'Without the recovery phrase, a forgotten password cannot be recovered and your encrypted data will be permanently lost. Store it somewhere safe immediately after registration.'
          },
          {
            q: 'Can I share a key safely?',
            a: 'Yes. Share links are single-use, CAPTCHA-protected, and can be revoked at any time. Once the key is revealed, it is automatically marked as used.'
          },
          {
            q: 'What happens if a Steam game is removed from the store?',
            a: 'The game stays in your library as a custom game. You never lose your data. Only the automatic metadata (cover art, publisher) is no longer filled.'
          },
          {
            q: 'Can I move my library to another account or instance?',
            a: 'Yes. Export your data as CSV or JSON from My Account, then import it into any other SteamKeyVault account.'
          },
          {
            q: 'How do I add a non-Steam game key?',
            a: 'Add a custom game (no Steam App ID required) and attach your key to it. You can always convert it to a Steam game later.'
          },
          {
            q: 'Is there a limit on how many keys I can store?',
            a: 'No artificial limit is imposed by the application. Import and store as many keys as you need.'
          },
          {
            q: 'Can the recipient save or forward a share link?',
            a: 'The link works only once. After the key is revealed, the link is permanently invalidated and cannot be reused.'
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
        placeholder: "youremail{'@'}exemple.com",
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
        passwordRequirements: "Password must: be 12+ characters, contain lowercase, uppercase, digit, and special character"
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
        passwordRequirements: "Password must: be 12+ characters, contain lowercase, uppercase, digit, and special character",
        errors: {
          passwordMismatch: 'Passwords do not match.',
          registrationFailed: 'Registration failed.',
          captchaRequired: 'Please complete the captcha.'
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
      exportMarkdown: 'Export Markdown',
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
      promo: 'This key was shared using SteamKeyVault. Manage and share your keys securely.',
      createAccount: 'Create an account',
      revealedKey: 'Revealed key',
      activateSteam: 'Activate on Steam',
      revealKey: 'Reveal key',
      captchaMissing: 'Captcha is not configured.',
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
        special: "Password must contain at least one special character"
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
      eyebrow: 'Gratuit · Sécurisé · Centré sur la vie privée',
      heroTitle: 'Vos clés Steam, en sécurité et bien organisées',
      heroSubtitle: 'SteamKeyVault chiffre, organise et vous permet de partager vos clés de jeux, le tout sous votre contrôle.',
      getStarted: 'Commencer gratuitement',
      learnMore: 'En savoir plus',
      viewDocs: 'Lire la documentation',
      trustItems: [
        { icon: 'pi-lock', label: 'Chiffrement de bout en bout' },
        { icon: 'pi-file-export', label: 'Contrôle total de vos données' },
        { icon: 'pi-eye-slash', label: 'Zéro traceur' },
        { icon: 'pi-globe', label: 'Disponible sur tous vos appareils' }
      ],
      featuresTitle: 'Tout ce qu\'il faut pour gérer vos clés',
      featuresDesc: 'Conçu pour les collectionneurs, traders et joueurs qui tiennent à leur vie privée.',
      features: [
        {
          icon: 'pi-lock',
          title: 'Chiffrement de bout en bout',
          desc: 'Vos clés Steam sont chiffrées dans votre navigateur avant d\'atteindre le serveur. Vous seul pouvez les lire.'
        },
        {
          icon: 'pi-arrow-right-arrow-left',
          title: 'Partage de clés simplifié',
          desc: 'Générez un lien unique et expirant pour partager n\'importe quelle clé, sans compte requis pour le destinataire.'
        },
        {
          icon: 'pi-file-export',
          title: 'Contrôle total de vos données',
          desc: 'Vous pouvez exporter votre bibliothèque complète de jeux et clés à tout moment.'
        },
        {
          icon: 'pi-tags',
          title: 'Organisation et recherche',
          desc: 'Filtrez par jeu, marquez les clés utilisées ou à échanger, et retrouvez n\'importe quelle clé instantanément.'
        },
        {
          icon: 'pi-upload',
          title: 'Import en un clic',
          desc: 'Importez des clés depuis un fichier CSV ou TXT en quelques secondes. Parfait pour Humble Bundle ou Fanatical.'
        },
        {
          icon: 'pi-link',
          title: 'Intégration Steam',
          desc: 'Les jeux sont associés automatiquement aux titres Steam avec jaquettes, éditeurs et liens vers le magasin.'
        }
      ],
      howItWorksTitle: 'Prêt en quelques minutes',
      howItWorksDesc: 'Aucune configuration complexe. Ajoutez vos clés, SteamKeyVault s\'occupe du reste.',
      steps: [
        {
          number: '01',
          icon: 'pi-user-plus',
          title: 'Créez votre compte',
          desc: 'Inscription en quelques secondes. Vos clés de chiffrement sont générées localement, nous ne les voyons jamais.'
        },
        {
          number: '02',
          icon: 'pi-upload',
          title: 'Importez votre bibliothèque',
          desc: 'Ajoutez des clés une par une ou importez en masse depuis un CSV. Les clés sont chiffrées avant de quitter votre navigateur.'
        },
        {
          number: '03',
          icon: 'pi-share-alt',
          title: 'Organisez et partagez',
          desc: 'Étiquetez vos clés selon leur usage, générez des liens de partage et nettoyez votre bibliothèque des clés utilisées.'
        }
      ],
      securityTitle: 'Vos clés vous appartiennent',
      securityDesc: 'Avec SteamKeyVault, la sécurité et la confidentialité sont au cœur de tout ce que nous faisons. Voici comment nous protégeons vos précieuses clés de jeux :',
      securityPoints: [
        'Les clés sont chiffrées dans votre navigateur avec vos identifiants avant d\'être envoyées au serveur.',
        'Le serveur ne stocke que du texte chiffré, une fuite de base de données n\'expose rien de lisible.',
        'Les exports sont déchiffrés sur votre appareil, jamais côté serveur.',
        'Aucun analytique, aucun SDK tiers, aucun traceur. Vos données restent les vôtres.'
      ],
      securityEyebrow: 'Sécurité',
      securityCard: {
        label: 'Coffre chiffré',
        browser: 'Votre navigateur',
        server: 'Serveur',
        aes: 'AES-256',
        note: 'Le serveur ne reçoit que du texte chiffré'
      },
      ctaTitle: 'Prêt à sécuriser votre bibliothèque Steam ?',
      ctaDesc: 'Rejoignez SteamKeyVault aujourd\'hui, gratuit et centré sur la vie privée.',
      ctaButton: 'Créer votre coffre gratuitement',
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
          a: 'Toutes les clés sont chiffrées de bout en bout dans votre navigateur. Vous seul possédez la clé de déchiffrement. Même l\'admin du serveur ne peut pas lire vos clés.'
        },
        {
          q: 'Puis-je partager des clés avec des personnes sans compte ?',
          a: 'Oui. Vous générez un lien unique qui révèle la clé une seule fois, protégé par un captcha. Aucun compte requis pour le destinataire.'
        },
        {
          q: 'Comment importer mes clés existantes ?',
          a: 'Utilisez l\'import CSV/TXT, une ligne par jeu au format gameName;key1;key2. Les clés sont chiffrées localement avant l\'envoi.'
        },
        {
          q: 'SteamKeyVault est-il vraiment gratuit ?',
          a: 'Oui. SteamKeyVault est entièrement gratuit.'
        },
        {
          q: 'Que se passe-t-il si j\'oublie mon mot de passe ?',
          a: 'À l\'inscription, vous recevez une phrase de récupération de 12 mots. Conservez-la précieusement, c\'est le seul moyen de récupérer vos données chiffrées.'
        }
      ]
    },
    about: {
      title: 'À propos',
      body: 'Ceci est une page à propos'
    },
    footer: {
      terms: 'Conditions d\'utilisation',
      privacy: 'Politique de confidentialité'
    },
    legal: {
      title: 'Mentions légales',
      disclaimer: {
        title: 'Avertissement (Marque Steam)',
        body: 'SteamKeyVault est un projet personnel indépendant et n\'est en aucun cas affilié, autorisé, approuvé ou sponsorisé par Valve Corporation ou Steam.',
        trademark: 'Steam®, le logo Steam et tous les logos et emblèmes associés sont des marques déposées ou des marques commerciales de Valve Corporation aux États-Unis et/ou dans d\'autres pays. Toutes les autres marques sont la propriété de leurs détenteurs respectifs.'
      },
      publisher: {
        title: 'Éditeur',
        body: 'SteamKeyVault est un projet personnel développé et maintenu de manière indépendante. Il ne constitue pas une entité commerciale.',
        nameLabel: 'Nom du projet',
        contactLabel: 'Contact',
        contactValue: 'contact@steamkeyvault.com'
      },
      hosting: {
        title: 'Hébergement',
        body: 'Le service SteamKeyVault est hébergé sur un serveur privé géré par le responsable du projet.'
      },
      dataPrivacy: {
        title: 'Données personnelles',
        body: 'SteamKeyVault ne collecte que les données strictement nécessaires au fonctionnement du service (identifiants de compte et clés de jeux chiffrées). Aucune donnée personnelle n\'est vendue ni partagée avec des tiers. Pour plus de détails, consultez la Politique de confidentialité.'
      },
      liability: {
        title: 'Limitation de responsabilité',
        body: 'SteamKeyVault est fourni « en l\'état », sans garantie d\'aucune sorte. Le responsable du projet ne peut être tenu responsable de toute perte de données, interruption de service ou dommage résultant de l\'utilisation de ce service.'
      }
    },
    terms: {
      title: 'Conditions d\'utilisation',
      effectiveDate: 'Date d\'entrée en vigueur',
      s1: {
        title: 'Informations sur la plateforme',
        body: 'SteamKeyVault est un projet indépendant permettant de stocker, organiser et partager des clés de jeux Steam de façon sécurisée.',
        disclaimer: 'SteamKeyVault n\'est en aucun cas affilié, approuvé, sponsorisé ou officiellement lié à Valve Corporation ou à Steam. Steam et le logo Steam sont des marques déposées de Valve Corporation.'
      },
      s2: {
        title: 'Acceptation des conditions',
        body: 'En créant un compte ou en utilisant SteamKeyVault, vous acceptez les présentes Conditions d\'utilisation. Les responsables du projet se réservent le droit de les modifier à tout moment. L\'utilisation continue du service après une modification vaut acceptation des nouvelles conditions.'
      },
      s3: {
        title: 'Comptes utilisateurs & responsabilités',
        body: 'La création d\'un compte est nécessaire pour accéder aux fonctionnalités complètes de SteamKeyVault. En vous inscrivant, vous acceptez de :',
        i1: 'Fournir des informations exactes et protéger vos identifiants de connexion.',
        i2: 'Être entièrement responsable de toutes les activités effectuées depuis votre compte.',
        i3: 'Signaler immédiatement aux administrateurs toute utilisation non autorisée de votre compte.'
      },
      s4: {
        title: 'Politique d\'utilisation',
        body: 'Vous vous engagez à ne pas utiliser SteamKeyVault à des fins illicites. Les activités interdites comprennent notamment :',
        i1: 'Le partage, la distribution ou l\'échange de clés obtenues par des moyens illégaux ou non autorisés.',
        i2: 'Toute tentative de rétro-ingénierie, de perturbation ou d\'abus de l\'infrastructure du service.',
        i3: 'L\'usurpation d\'identité ou la fausse déclaration d\'appartenance à une entité quelconque.'
      },
      s5: {
        title: 'Avertissement (Marque Steam)',
        body: 'SteamKeyVault est un projet indépendant et n\'est en aucun cas affilié, autorisé, approuvé ou sponsorisé par Valve Corporation.',
        trademark: 'Steam®, le logo Steam et tous les logos et emblèmes associés sont des marques déposées ou des marques commerciales de Valve Corporation aux États-Unis et/ou dans d\'autres pays. Toutes les autres marques sont la propriété de leurs détenteurs respectifs.'
      },
      s6: {
        title: 'Propriété intellectuelle',
        body: 'Le nom, le design et l\'infrastructure de SteamKeyVault restent la propriété des responsables du projet. Les utilisateurs conservent la pleine propriété des données qu\'ils importent.'
      },
      s7: {
        title: 'Limitation de responsabilité',
        body: 'SteamKeyVault est fourni « en l\'état », sans garantie d\'aucune sorte, expresse ou implicite. Les responsables du projet déclinent toute responsabilité pour les dommages directs, indirects, accessoires ou consécutifs résultant de l\'utilisation ou de l\'impossibilité d\'utiliser le service, y compris la perte de clés ou de données de compte.'
      },
      s8: {
        title: 'Résiliation de compte',
        body: 'Vous pouvez supprimer votre compte à tout moment depuis vos paramètres. Les responsables se réservent le droit de suspendre ou de supprimer les comptes qui enfreignent ces Conditions, se livrent à des activités frauduleuses ou menacent la sécurité du service. Après suppression, vos données seront définitivement effacées sous 30 jours.'
      },
      s9: {
        title: 'Contact',
        body: 'Pour toute question concernant ces Conditions d\'utilisation, veuillez contacter directement le responsable du projet.'
      }
    },
    privacy: {
      title: 'Politique de confidentialité',
      effectiveDate: 'Date d\'entrée en vigueur',
      s1: {
        title: 'Données collectées',
        body: 'SteamKeyVault ne collecte que les données strictement nécessaires au fonctionnement du service :',
        i1: 'Informations de compte : nom d\'utilisateur, adresse e-mail et mot de passe haché.',
        i2: 'Clés de jeux : stockées chiffrées. Vos clés sont chiffrées côté navigateur avant d\'être envoyées au serveur.',
        i3: 'Données de session : un cookie de session utilisé pour l\'authentification.'
      },
      s2: {
        title: 'Finalités de la collecte',
        body: 'Nous collectons ces données uniquement pour :',
        i1: 'Fournir, exploiter et maintenir le service SteamKeyVault.',
        i2: 'Authentifier les utilisateurs et protéger les comptes.',
        i3: 'Permettre les fonctionnalités de partage de clés entre utilisateurs.'
      },
      s3: {
        title: 'Stockage & sécurité des données',
        body: 'SteamKeyVault utilise plusieurs couches de protection pour sécuriser vos données :',
        i1: 'Chiffrement côté client : vos clés de jeux sont chiffrées dans votre navigateur avant d\'être stockées. Le serveur ne reçoit jamais les clés en clair.',
        i2: 'Sécurité des échanges : toutes les communications sont protégées via TLS/HTTPS.',
        i3: 'Contrôle d\'accès : seuls les utilisateurs authentifiés peuvent accéder à leurs propres données.'
      },
      s4: {
        title: 'Partage & tiers',
        body: 'SteamKeyVault ne vend, ne loue et ne partage vos données personnelles avec aucun tiers à des fins commerciales ou publicitaires. Aucun traceur analytique ni service publicitaire n\'est intégré. Le partage de données se limite à l\'infrastructure serveur utilisée pour faire fonctionner le service.'
      },
      s5: {
        title: 'Vos droits (RGPD)',
        body: 'Si vous résidez dans l\'Union européenne, vous disposez des droits suivants concernant vos données personnelles :',
        i1: 'Droit d\'accès : demander une copie des données personnelles que nous détenons vous concernant.',
        i2: 'Droit de rectification : corriger des données inexactes ou incomplètes depuis vos paramètres.',
        i3: 'Droit à l\'effacement : demander la suppression de votre compte et de toutes les données associées.',
        i4: 'Droit à la portabilité : exporter vos données à tout moment depuis vos paramètres.'
      },
      s6: {
        title: 'Conservation des données',
        body: 'Nous conservons vos données uniquement le temps de l\'activité de votre compte :',
        i1: 'Comptes actifs : les données sont conservées tant que votre compte est actif.',
        i2: 'Comptes supprimés : lors de la suppression du compte, toutes les données sont définitivement effacées sous 30 jours.',
        i3: 'Sauvegardes : les copies de sauvegarde peuvent être conservées jusqu\'à 90 jours après la suppression à des fins de reprise après sinistre.'
      },
      s7: {
        title: 'Modifications de cette politique',
        body: 'Nous pouvons mettre à jour cette Politique de confidentialité ponctuellement. En cas de modification, nous actualiserons la date en haut de cette page. L\'utilisation continue du service après une modification vaut acceptation de la nouvelle politique.'
      }
    },
    docs: {
      eyebrow: 'Guide utilisateur',
      title: 'Documentation SteamKeyVault',
      subtitle: 'Tout ce qu\'il faut pour protéger vos clés, gérer votre bibliothèque et partager en toute confiance.',
      quickAccess: 'Sur cette page',
      toc: {
        gettingStarted: 'Premiers pas',
        encryption: 'Chiffrement & sécurité',
        managingLibrary: 'Gérer votre bibliothèque',
        importExport: 'Import & export',
        sharing: 'Partager une clé par lien',
        customVsSteam: 'Jeux personnalisés vs Steam',
        lestrades: 'Export lestrades.com',
        deleteUsed: 'Supprimer les clés utilisées',
        accountSettings: 'Compte & paramètres',
        qa: 'Questions / réponses'
      },
      gettingStarted: {
        title: 'Premiers pas',
        body: 'Créez un compte gratuit pour commencer à ajouter vos clés Steam. La configuration complète prend moins d\'une minute.',
        registerTitle: 'Créer votre compte',
        registerSteps: [
          'Accédez à la page Inscription.',
          'Saisissez votre adresse e-mail, un nom d\'utilisateur et un mot de passe fort (12 caractères minimum).',
          'Validez le formulaire. Une phrase de récupération de 12 mots s\'affiche immédiatement.',
          'Copiez et sauvegardez cette phrase en lieu sûr avant de fermer la fenêtre.',
          'Vérifiez votre adresse e-mail en cliquant sur le lien envoyé dans votre boîte mail.'
        ],
        recoveryPhraseTitle: 'Votre phrase de récupération, conservez-la précieusement',
        recoveryPhraseBody: 'La phrase de récupération est le seul moyen de réinitialiser votre mot de passe et de récupérer vos données chiffrées. Sans elle, un mot de passe oublié entraîne une perte définitive de vos données.',
        recoveryPhraseList: [
          'Générée localement dans votre navigateur, jamais transmise au serveur.',
          'Notez-la ou stockez-la dans un gestionnaire de mots de passe.',
          'Conservez-la séparément de votre mot de passe.',
          'Ne la partagez jamais, même avec le support.'
        ]
      },
      encryption: {
        title: 'Chiffrement & sécurité',
        body: 'Vos clés sont chiffrées dans votre navigateur avant d\'être envoyées au serveur. Vous seul pouvez les voir en clair quand vous êtes connecté. Même l\'administrateur du serveur ne peut pas les lire.',
        whyTitle: 'Pourquoi cela vous protège',
        whyList: [
          'Les clés sont illisibles pour toute personne sans votre session active.',
          'Une fuite de sauvegarde ou de snapshot n\'expose que du texte chiffré.',
          'Les exports sont déchiffrés sur votre appareil uniquement, juste avant le téléchargement.',
          'Un changement de mot de passe re-chiffre automatiquement toutes vos données.'
        ],
        expectTitle: 'Ce à quoi vous devez vous attendre',
        expectList: [
          'Après déconnexion ou nettoyage de session, vous devez vous reconnecter pour voir vos clés.',
          'Les imports sont chiffrés localement avant envoi. Vos données ne transitent jamais non protégées.'
        ]
      },
      managingLibrary: {
        title: 'Gérer votre bibliothèque',
        body: 'Tous vos jeux et clés sont accessibles dans Mes clés. La colonne de gauche liste vos jeux ; la droite affiche les clés du jeu sélectionné.',
        addGameTitle: 'Ajouter un jeu',
        addGameSteps: [
          'Ouvrez Mes clés.',
          'Cliquez sur le bouton + en haut de la colonne des jeux.',
          'Recherchez un titre Steam ou saisissez un nom personnalisé.',
          'Confirmez pour l\'ajouter à votre bibliothèque.'
        ],
        addKeyTitle: 'Ajouter une clé',
        addKeySteps: [
          'Sélectionnez un jeu dans la colonne de gauche.',
          'Cliquez sur Ajouter une clé dans le tableau.',
          'Collez la valeur de la clé.',
          'La clé est chiffrée localement avant d\'être enregistrée.'
        ],
        statusesTitle: 'Statuts des clés',
        statusesBody: 'Chaque clé possède l\'un des trois états suivants :',
        statuses: [
          { name: 'Available', desc: 'La clé n\'a pas encore été partagée ni utilisée.' },
          { name: 'Sharing', desc: 'Un lien de partage actif existe pour cette clé. Elle sera marquée Utilisée dès que le destinataire la révèle.' },
          { name: 'Used', desc: 'La clé a été révélée via un lien de partage ou manuellement marquée comme utilisée.' }
        ],
        convertTitle: 'Convertir un jeu personnalisé en jeu Steam',
        convertSteps: [
          'Sélectionnez le jeu personnalisé dans Mes clés.',
          'Ouvrez le menu d\'actions (trois points).',
          'Choisissez Convertir en jeu Steam.',
          'Recherchez le titre Steam correspondant et confirmez.'
        ]
      },
      importExport: {
        title: 'Import & export',
        managePrefix: 'Vous pouvez gérer les imports et exports depuis',
        manageMiddle: 'et la page',
        manageSuffix: '.',
        csvImportTitle: 'Import CSV ou TXT',
        csvImportSteps: [
          'Ouvrez la page Import.',
          'Déposez votre fichier ou cliquez sur Sélectionner un fichier.',
          'Chaque ligne doit suivre le format : gameName;key1;key2',
          'Un panneau de progression affiche les résultats et les éventuelles erreurs par jeu.'
        ],
        csvImportNote: 'Taille de fichier max : 10 Mo. Les clés sont chiffrées localement avant l\'envoi.',
        csvExportTitle: 'Export CSV',
        csvExportSteps: [
          'Ouvrez Mon compte.',
          'Cliquez sur Export CSV dans la section Gestion des données.',
          'Votre fichier est déchiffré localement sur votre appareil avant le téléchargement.'
        ],
        jsonTitle: 'Import / export JSON (format SteamKeyVault)',
        jsonItems: [
          'L\'export JSON conserve la structure SteamKeyVault pour un ré-import facile.',
          'L\'import JSON chiffre toutes les clés localement avant l\'envoi.',
          'Utilisez JSON pour des sauvegardes complètes lors d\'une migration vers une nouvelle instance.'
        ]
      },
      sharing: {
        title: 'Partager une clé par lien',
        body: 'Générez un lien temporaire à usage unique pour n\'importe quelle clé et envoyez-le. Le destinataire révèle la clé sur une page publique (aucun compte requis).',
        createTitle: 'Créer un lien de partage',
        createSteps: [
          'Ouvrez Mes clés.',
          'Cliquez sur l\'icône de partage de la clé souhaitée.',
          'Définissez une date d\'expiration si besoin.',
          'Copiez le lien et envoyez-le au destinataire.'
        ],
        behaviorTitle: 'Fonctionnement des liens de partage',
        behaviorList: [
          'Chaque lien ne peut être utilisé qu\'une seule fois. La clé est révélée exactement une fois.',
          'Un captcha protège contre les robots automatisés.',
          'Le destinataire peut vous envoyer un court message après avoir révélé la clé.',
          'Vous pouvez révoquer tout lien actif depuis la fenêtre de partage à tout moment.',
          'Une fois révélée, la clé est automatiquement marquée comme Utilisée dans votre coffre.'
        ]
      },
      customVsSteam: {
        title: 'Jeux personnalisés vs jeux Steam',
        body: 'SteamKeyVault prend en charge les jeux liés à Steam (avec métadonnées automatiques) et les jeux entièrement personnalisés pour les titres non disponibles sur Steam.',
        steamTitle: 'Jeux Steam',
        steamList: [
          'Liés à un App ID Steam.',
          'Titre, jaquette, éditeur et lien vers le store remplis automatiquement.',
          'Si l\'App ID devient invalide, le jeu est conservé comme jeu personnalisé.'
        ],
        customTitle: 'Jeux personnalisés',
        customList: [
          'Créez un jeu avec n\'importe quel nom (aucun App ID Steam requis).',
          'Vous pouvez le convertir en jeu Steam plus tard une fois l\'App ID trouvé.',
          'Idéal pour les clés GOG, Epic, Ubisoft Connect et autres plateformes.'
        ]
      },
      lestrades: {
        title: 'Export lestrades.com',
        body: 'Générez un bloc de texte à coller directement dans lestrades.com pour lister vos clés disponibles à l\'échange.',
        whereTitle: 'Où le trouver',
        whereSteps: [
          'Ouvrez Mes clés.',
          'Cliquez sur le menu à trois points en haut de la colonne des jeux.',
          'Sélectionnez Export pour lestrades.com.'
        ],
        formatTitle: 'Détails du format',
        formatList: [
          'Un jeu par ligne.',
          'Format jeu Steam : GameName/steamAppId',
          'Format jeu personnalisé : GameName (sans App ID)',
          'Seuls les jeux avec au moins une clé disponible sont inclus.',
          'Le résultat est copié directement dans votre presse-papiers.'
        ]
      },
      deleteUsed: {
        title: 'Supprimer les clés utilisées',
        body: 'Supprimez en une seule action toutes les clés marquées comme utilisées dans toute votre bibliothèque.',
        stepsTitle: 'Étapes',
        steps: [
          'Ouvrez Mes clés.',
          'Cliquez sur le menu à trois points en haut de la colonne des jeux.',
          'Choisissez Supprimer toutes les clés utilisées.',
          'Confirmez l\'action dans la fenêtre de dialogue.'
        ],
        note: 'Cette action est définitive et irréversible.'
      },
      accountSettings: {
        title: 'Compte & paramètres',
        body: 'Gérez votre profil, sécurité et préférences depuis Mon compte.',
        passwordTitle: 'Changer votre mot de passe',
        passwordBody: 'Changer votre mot de passe re-dérive la clé de chiffrement. Toutes vos clés sont automatiquement re-chiffrées avec le nouveau mot de passe. Aucun ré-import nécessaire.',
        passwordSteps: [
          'Ouvrez Mon compte.',
          'Faites défiler jusqu\'à la section Sécurité.',
          'Saisissez votre mot de passe actuel, puis le nouveau.',
          'Cliquez sur Mettre à jour le mot de passe.'
        ],
        passwordNote: 'Minimum 12 caractères, avec au moins une minuscule, une majuscule, un chiffre et un caractère spécial.',
        emailTitle: 'Modifier votre adresse e-mail',
        emailSteps: [
          'Ouvrez Mon compte.',
          'Saisissez la nouvelle adresse dans la section Paramètres e-mail.',
          'Un lien de confirmation est envoyé à la nouvelle adresse.',
          'Cliquez sur le lien dans votre boîte mail pour finaliser le changement.'
        ],
        markdownTitle: 'Export Markdown',
        markdownBody: 'Crée une liste Markdown formatée de vos jeux Steam avec des liens vers leurs pages store, utile pour des posts, forums ou suivis externes.',
        markdownSteps: [
          'Ouvrez Mes clés.',
          'Cliquez sur le menu à trois points en haut de la colonne des jeux.',
          'Sélectionnez Export en Markdown.',
          'Le résultat est copié dans votre presse-papiers.'
        ]
      },
      qa: {
        title: 'Questions / réponses',
        items: [
          {
            q: 'Stockez-vous mes clés en clair ?',
            a: 'Non. Les clés sont chiffrées dans votre navigateur avant d\'être envoyées au serveur. Celui-ci ne stocke que du texte chiffré et ne peut pas lire vos clés.'
          },
          {
            q: 'Que se passe-t-il si je perds ma phrase de récupération ?',
            a: 'Sans la phrase de récupération, un mot de passe oublié ne peut pas être récupéré et vos données chiffrées seront définitivement perdues. Conservez-la en lieu sûr dès l\'inscription.'
          },
          {
            q: 'Puis-je partager une clé en toute sécurité ?',
            a: 'Oui. Les liens de partage sont à usage unique, protégés par un captcha et révocables à tout moment. Une fois la clé révélée, elle est automatiquement marquée comme utilisée.'
          },
          {
            q: 'Que se passe-t-il si un jeu Steam est retiré du store ?',
            a: 'Le jeu reste dans votre bibliothèque comme jeu personnalisé. Vous ne perdez jamais vos données. Seules les métadonnées automatiques (jaquette, éditeur) ne sont plus remplies.'
          },
          {
            q: 'Puis-je déplacer ma bibliothèque vers un autre compte ou une autre instance ?',
            a: 'Oui. Exportez vos données en CSV ou JSON depuis Mon compte, puis importez-les dans n\'importe quel autre compte ou instance SteamKeyVault.'
          },
          {
            q: 'Comment ajouter une clé pour un jeu non disponible sur Steam ?',
            a: 'Ajoutez un jeu personnalisé (aucun App ID requis) et associez-y votre clé. Vous pourrez toujours le convertir en jeu Steam plus tard.'
          },
          {
            q: 'Y a-t-il une limite au nombre de clés stockables ?',
            a: 'Aucune limite artificielle n\'est imposée par l\'application. Importez et stockez autant de clés que nécessaire.'
          },
          {
            q: 'Le destinataire peut-il sauvegarder ou transférer un lien de partage ?',
            a: 'Le lien ne fonctionne qu\'une seule fois. Une fois la clé révélée, le lien est définitivement invalidé et ne peut plus être utilisé.'
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
        placeholder: "votremail{'@'}exemple.com",
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
        passwordRequirements: "Le mot de passe doit : contenir au moins 12 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial"
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
        passwordRequirements: "Le mot de passe doit : contenir au moins 12 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial",
        errors: {
          passwordMismatch: 'Les mots de passe ne correspondent pas.',
          registrationFailed: "Échec de l'inscription.",
          captchaRequired: 'Veuillez compléter le captcha.'
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
      exportMarkdown: 'Exporter en Markdown',
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
      promo: 'Cette clé a été partagée via SteamKeyVault. Gérez et partagez vos clés en toute sécurité.',
      createAccount: 'Créer un compte',
      revealedKey: 'Clé révélée',
      activateSteam: 'Activer sur Steam',
      revealKey: 'Révéler la clé',
      captchaMissing: "Le captcha n'est pas configuré.",
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
        special: "Le mot de passe doit contenir au moins un caractère spécial"
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
