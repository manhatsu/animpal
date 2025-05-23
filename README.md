# AnimPal: Make Deeper Connection With Your Pal

## Getting Started

1. Install the dependencies.

    ```bash
    npm install
    ```

1. Make `.env.local` file and add your Gemini API key.

    ```
    GEMINI_API_KEY=your_gemini_api_key
    ```

1. Run the development server.

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## If you reach limit of API calls

You can attach preset images on your diary instead.  
Replace images under `public/images` with your own.  
Filenames should be the same as the emotions defined in `src/app/utils/emotions.ts`.

## Deploy on Vercel

now in progress...

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
