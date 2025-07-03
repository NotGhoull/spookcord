![Spookcord banner](.readme_assets/spookcord_banner.png)

# Spookcord

> The spookiest, open-source Discord clone – designed for fun, privacy, and self-hosting.

---

## 👻 About Spookcord

Spookcord is an early-stage, open-source communication platform aiming to be a fun, privacy-focused, and fully self-hostable alternative to popular chat applications like Discord.

Currently, Spookcord offers basic functionalities, including:

- **Text Chat:** Engage in real-time text conversations.
- **Server Creation & Management:** Create your own communities and organize them with channels. (Currently limited in functionality)
- **Channel Management:** Set up various channels within your servers for different topics. (Currently almost non-functional)

Future updates are planned to bring even more features, including direct messages and voice calls, with the goal of achieving (mostly) feature parity with Discord, plus some exciting extras.

---

## 🚀 Technologies Used

Spookcord leverages a modern and efficient technology stack to deliver a fast and responsive experience:

- **Frontend:** [Svelte](https://svelte.dev/)
- **Backend:** [Hono.js](https://hono.dev/)
- **RPC:** [oRPC](https://github.com/oRPC/orpc)
- **Database:** [Supabase](https://supabase.com/) + [DrizzleORM](https://orm.drizzle.team/)

---

## ✨ Why Spookcord?

Spookcord gives you full control over your chat application, making it an excellent choice for:

- **Privacy-Conscious Users:** Take back control of your data by hosting your own communication platform.
- **Developers & Enthusiasts:** Dive into the codebase, learn from its modern stack, and contribute to an exciting open-source project.
- **Customization Seekers:** The open-source nature allows for deep customization to fit your specific needs and preferences.

---

## 🚧 Current Development Status

Spookcord is currently in **heavy development**. This means you might encounter bugs and rough edges as features are rapidly being implemented and refined. We are actively working towards building a robust and feature-rich platform.

---

## ⚙️ Getting Started

To get Spookcord up and running on your local machine, follow these steps:

### Prerequisites

Before you begin, ensure you have the following installed:

- **[Bun](https://bun.sh/)**: A fast, all-in-one JavaScript runtime.
- **[Docker](https://www.docker.com/) or [Podman](https://podman.io/)**: For managing the Supabase local development environment.

### Installation & Setup

> Ensure you have the project cloned first `git clone https://github.com/notghoull/spookcord.git`

1.  **Install Bun:** If you haven't already, install Bun by following the instructions on the [official Bun website](https://bun.sh/docs/installation).
2.  **Install Dependencies:** Navigate to the project root and install the necessary dependencies:
    ```bash
    bun install
    ```
3.  **Start Supabase:** You can either run Supabase locally using Docker/Podman or connect to a Supabase cloud instance.
    - **Local Supabase (Recommended for development):**
      ```bash
      bunx supabase start
      ```
      > **NOTE**
      > This command will output the local Supabase URLs and anon key. Make note of these, especially the DATABASE_URL and SUPABASE_URL (usually http://localhost:54321) and SUPABASE_ANON_KEY (which you'll need for client-side configuration if you were using the Supabase client directly, though your setup abstracts this).
    - **Supabase Cloud:** You'll configure your `.env` variables (see next step) with your Supabase cloud project details.
4.  **Set Environment Variables:** You'll need to set several environment variables. Create a `.env` file in the project root and add the following:

    - **Server-side variables (/apps/server/.env):**
      ```
      CORS_ORIGIN=http://localhost:5173 # Or wherever your frontend is located
      BETTER_AUTH_SECRET=aRandomStringOfCharacters # Generate a strong, random string
      BETTER_AUTH_URL=http://localhost:3000
      DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres # Or get this from your Supabase cloud provider
      SUPABASE_JWT_SECRET=someSupabaseJWTSecret # Your Supabase JWT secret
      ```
    - **Website-side variables (/apps/web/.env):**
      ```
      PUBLIC_SERVER_URL=http://localhost:3000 # Or wherever your backend server is located
      PUBLIC_SUPABASE_URL=http://localhost:54321 # Or wherever your Supabase server is
      ```

5.  **Run the Application:** Once dependencies are installed and environment variables are set, you can start the development server:
    ```bash
    bun run dev
    ```
    Spookcord will now be accessible in your web browser at `http://localhost:5173`.

---

## 🤝 Contributing

We welcome contributions from the community! As Spookcord is in very early development, virtually any contribution is valuable, from bug reports and feature suggestions to code contributions.

Once the project matures, we will establish more formal contribution guidelines, a code of conduct, and preferred branching models. For now, feel free to open issues or submit pull requests.

---

## 🛣️ Future Plans

Our roadmap for Spookcord includes:

- Implementing **Direct Messages** for private conversations.
- Adding robust **Voice Call** functionality.
- Achieving (mostly) **feature parity with Discord**, while also introducing unique "spooky" features.
- Continuous bug fixing and performance improvements.

---

## 📄 License

_(To be decided - It'll probably be a copyleft license though)_
