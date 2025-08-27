import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    console.log("🔗 Social Connect API - Starting...");

    const session = await auth();
    if (!session?.user?.email) {
      console.log("❌ Social Connect - No session or email");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { platform } = await request.json();
    console.log("🎯 Social Connect - Platform requested:", platform);

    if (!["twitter", "discord"].includes(platform)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    // Check if already connected
    const { data: existingConnection, error: fetchError } = await supabaseAdmin
      .from("user_social_connections")
      .select("*")
      .eq("user_email", session.user.email)
      .eq("platform", platform)
      .single();

    console.log("📊 Social Connect - Existing connection check:", {
      existingConnection: existingConnection,
      fetchError: fetchError,
    });

    if (existingConnection && existingConnection.is_verified) {
      return NextResponse.json(
        {
          error: `${platform} account already connected`,
          connection: existingConnection,
        },
        { status: 400 }
      );
    }

    // Generate a verification token for tracking this connection
    const verificationToken = `${platform}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Store pending connection
    const { data: pendingConnection, error: insertError } = await supabaseAdmin
      .from("user_social_connections")
      .upsert(
        [
          {
            user_email: session.user.email,
            platform: platform,
            is_verified: false,
            verification_token: verificationToken,
          },
        ],
        {
          onConflict: "user_email,platform",
          ignoreDuplicates: false,
        }
      )
      .select("*")
      .single();

    if (insertError) {
      console.log(
        "❌ Social Connect - Failed to create pending connection:",
        insertError
      );
      throw insertError;
    }

    console.log(
      "✅ Social Connect - Pending connection created:",
      pendingConnection
    );

    // Return the NextAuth sign-in URL for the platform
    const authUrl = `/api/auth/signin/${platform}?callbackUrl=${encodeURIComponent(
      `${process.env.NEXTAUTH_URL}/api/social/callback?token=${verificationToken}`
    )}`;

    return NextResponse.json({
      success: true,
      authUrl: authUrl,
      verificationToken: verificationToken,
      message: `Redirect to ${platform} authentication`,
    });
  } catch (error) {
    console.error("❌ Social Connect API Error:", error);
    return NextResponse.json(
      { error: "Failed to initiate social connection" },
      { status: 500 }
    );
  }
}
