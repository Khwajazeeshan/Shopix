"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function OAuthCallback() {
    const router = useRouter();
    const { status } = useSession();

    useEffect(() => {
        const syncSession = async () => {
            if (status === "authenticated") {
                try {
                    const response = await axios.get("/api/auth/sync");
                    if (response.data.success) {
                        toast.success("Signed in successfully!");
                        router.push("/");
                    } else {
                        toast.error("Failed to sync session");
                        router.push("/auth/login");
                    }
                } catch (error) {
                    console.error("Sync Error:", error);
                    toast.error("Something went wrong during authentication");
                    router.push("/auth/login");
                }
            } else if (status === "unauthenticated") {
                router.push("/auth/login");
            }
        };

        syncSession();
    }, [status, router]);

    return (
        <div >
            <div >
                <div ></div>
                <p >Finalizing authentication...</p>
            </div>
        </div>
    );
}
