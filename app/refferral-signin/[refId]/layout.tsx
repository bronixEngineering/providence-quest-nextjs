import { Metadata } from "next"

type Props = {
  params: { refId: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const refId = params.refId
  
  return {
    title: "Join Providence  - I invite you to Providence!",
    description: "Join me on Providence Quest and start your extraordinary journey! Complete quests, earn rewards, and level up your Trailblazer status.",
    openGraph: {
      title: "I invite you to Providence Quest! 🚀",
      description: "Join me on Providence Quest and start your extraordinary journey! Complete quests, earn rewards, and level up your Trailblazer status.",
      type: "website",
      url: `https://hub.playprovidence.io/refferral-signin/${refId}`,
      images: [
        {
          url: "https://urdsxlylixebqhvmsaeu.supabase.co/storage/v1/object/public/public-assets/providence-avatar.png",
          width: 1200,
          height: 630,
          alt: "Providence Quest - Join the Adventure",
        },
      ],
      siteName: "Providence Quest",
    },
    twitter: {
      card: "summary_large_image",
      title: "I invite you to Providence Quest! 🚀",
      description: "Join me on Providence Quest and start your extraordinary journey! Complete quests, earn rewards, and level up your Trailblazer status.",
      images: ["https://urdsxlylixebqhvmsaeu.supabase.co/storage/v1/object/public/public-assets/providence-avatar.png"],
    },
  }
}

export default function ReferralSigninLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
