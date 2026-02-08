<template>
  <div class="documentation-view">
    <header class="doc-hero">
      <div class="hero-content">
        <p class="eyebrow">User guide</p>
        <h1>SteamKeyVault Documentation</h1>
        <p class="subtitle">
          A simple guide to protect your keys, manage your library, and share with confidence.
        </p>
      </div>
    </header>

    <main class="doc-content">
      <section class="toc">
        <h2>Quick access</h2>
        <div class="toc-grid">
          <a href="#encryption" class="toc-item">Encryption and benefits</a>
          <a href="#import-export" class="toc-item">Import and export</a>
          <a href="#sharing" class="toc-item">Share a key by link</a>
          <a href="#custom-vs-steam" class="toc-item">Custom games vs Steam</a>
          <a href="#lestrades" class="toc-item">lestrades.com export</a>
          <a href="#delete-used" class="toc-item">Delete used keys</a>
          <a href="#qa" class="toc-item">Q&A</a>
        </div>
      </section>

      <section id="encryption" class="doc-section">
        <h2>Encryption and benefits</h2>
        <p>
          Your keys are encrypted in your browser before they are sent to the server. This means only you
          can see the keys in plain text when you are logged in.
        </p>
        <div class="doc-card">
          <h3>Why this protects you</h3>
          <ul>
            <li>Your keys are unreadable to anyone who does not have your login session.</li>
            <li>If a backup or database snapshot leaks, the keys remain protected.</li>
            <li>Exports are decrypted only on your device, right before download.</li>
          </ul>
        </div>
        <div class="doc-card">
          <h3>What to expect as a user</h3>
          <ul>
            <li>After logout or clearing the browser, you need to log in again to see keys.</li>
            <li>Imports are protected locally before upload, so your data stays private.</li>
          </ul>
        </div>
      </section>

      <section id="import-export" class="doc-section">
        <h2>Import and export</h2>
        <p>
          You can manage imports and exports from <strong>My Account</strong> and the <strong>Import</strong> page.
        </p>
        <div class="doc-card">
          <h3>CSV or TXT import</h3>
          <ol>
            <li>Open the Import page.</li>
            <li>Drop your file or click Select File.</li>
            <li>Expected format: <code>gameName;key1;key2</code> (one line per game).</li>
            <li>A progress panel shows results and errors.</li>
          </ol>
          <p class="note">Max file size: 10 MB.</p>
        </div>
        <div class="doc-card">
          <h3>CSV export</h3>
          <ol>
            <li>In My Account, click Export CSV.</li>
            <li>Your file is prepared and decrypted locally on your device.</li>
          </ol>
        </div>
        <div class="doc-card">
          <h3>JSON import or export (SteamKeyVault)</h3>
          <ul>
            <li>JSON export keeps the SteamKeyVault structure for easy re-import.</li>
            <li>JSON import encrypts keys locally before upload.</li>
          </ul>
        </div>
      </section>

      <section id="sharing" class="doc-section">
        <h2>Share a key by link</h2>
        <p>
          You can generate a temporary link for any key and send it to someone. The recipient reveals the
          key on a public page.
        </p>
        <div class="doc-card">
          <h3>Create a link</h3>
          <ol>
            <li>Open My Keys.</li>
            <li>Click the share icon on a key.</li>
            <li>Copy the link and send it.</li>
          </ol>
        </div>
        <div class="doc-card">
          <h3>How it behaves</h3>
          <ul>
            <li>The link has an expiration date.</li>
            <li>The key can be revealed only once.</li>
            <li>A captcha protects the key from bots.</li>
            <li>You can disable the link from the share dialog.</li>
          </ul>
        </div>
      </section>

      <section id="custom-vs-steam" class="doc-section">
        <h2>Custom games vs Steam games</h2>
        <p>
          SteamKeyVault supports Steam-linked games and custom games that are not on Steam.
        </p>
        <div class="doc-card">
          <h3>Steam games</h3>
          <ul>
            <li>Linked to a Steam App ID.</li>
            <li>Title, images, and publisher are filled automatically.</li>
          </ul>
        </div>
        <div class="doc-card">
          <h3>Custom games</h3>
          <ul>
            <li>Create a game with any name you want.</li>
            <li>Later, you can match it to a Steam game.</li>
            <li>If a Steam App ID becomes invalid, the game stays custom.</li>
          </ul>
        </div>
      </section>

      <section id="lestrades" class="doc-section">
        <h2>lestrades.com export</h2>
        <p>
          This export creates a text format you can paste directly into lestrades.com.
        </p>
        <div class="doc-card">
          <h3>Where to find it</h3>
          <ol>
            <li>Open My Keys.</li>
            <li>Click the three dots menu at the top of the games column.</li>
            <li>Select Export for lestrades.com.</li>
          </ol>
        </div>
        <div class="doc-card">
          <h3>Format</h3>
          <ul>
            <li>One game per line.</li>
            <li>Steam game: <code>GameName/steamAppId</code>.</li>
            <li>Custom game: <code>GameName</code>.</li>
            <li>The result is copied to your clipboard.</li>
          </ul>
        </div>
      </section>

      <section id="delete-used" class="doc-section">
        <h2>Delete used keys</h2>
        <p>
          You can remove all keys that are marked as used in a single action.
        </p>
        <div class="doc-card">
          <h3>Steps</h3>
          <ol>
            <li>Open My Keys.</li>
            <li>Open the three dots menu in the games column.</li>
            <li>Choose Delete all used keys and confirm.</li>
          </ol>
          <p class="note">This action cannot be undone.</p>
        </div>
      </section>

      <section id="qa" class="doc-section">
        <h2>Q&A</h2>
        <div class="doc-card">
          <h3>Do you store my keys in plain text?</h3>
          <p>No. Your keys are encrypted before they leave your device.</p>
        </div>
        <div class="doc-card">
          <h3>Can I share a key safely?</h3>
          <p>Yes. Share links are temporary, can be disabled, and allow a single reveal.</p>
        </div>
        <div class="doc-card">
          <h3>What happens if a Steam game is removed?</h3>
          <p>The game stays in your library as a custom game, so you do not lose your data.</p>
        </div>
        <div class="doc-card">
          <h3>Can I move my library to another account?</h3>
          <p>Yes. Export your data and import it into another account anytime.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.documentation-view {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--bg-secondary), var(--bg-primary) 50%);
}

.doc-hero {
  padding: 3rem 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
  background: radial-gradient(circle at top left, rgba(59, 130, 246, 0.12), transparent 55%);
}

.hero-content {
  max-width: 70rem;
  margin: 0 auto;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin: 0 0 0.5rem;
}

.doc-hero h1 {
  margin: 0 0 0.75rem;
  font-size: clamp(2rem, 3vw, 2.75rem);
  color: var(--text-primary);
}

.subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1.05rem;
  max-width: 42rem;
}

.doc-content {
  max-width: 70rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  display: grid;
  gap: 2rem;
}

.toc {
  background: var(--bg-primary);
  border-radius: 1rem;
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.toc h2 {
  margin: 0 0 1rem;
  color: var(--text-primary);
}

.toc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 0.75rem;
}

.toc-item {
  text-decoration: none;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: var(--bg-secondary);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.toc-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.doc-section {
  display: grid;
  gap: 1rem;
}

.doc-section h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.6rem;
}

.doc-section p {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

.doc-card {
  background: var(--bg-primary);
  border-radius: 1rem;
  border: 1px solid var(--border-color);
  padding: 1.25rem 1.5rem;
  box-shadow: var(--shadow-sm);
}

.doc-card h3 {
  margin: 0 0 0.75rem;
  color: var(--text-primary);
}

.doc-card ul,
.doc-card ol {
  margin: 0 0 0.75rem;
  padding-left: 1.25rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.doc-card code {
  background: var(--bg-tertiary);
  padding: 0.1rem 0.35rem;
  border-radius: 0.35rem;
  color: var(--primary-color);
  font-family: monospace;
}

.note {
  margin: 0;
  color: var(--text-tertiary);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .doc-hero {
    padding: 2.5rem 1.25rem 1.5rem;
  }

  .doc-content {
    padding: 1.5rem 1.25rem 3rem;
  }
}
</style>
