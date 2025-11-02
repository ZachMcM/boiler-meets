import { authClient } from "@/lib/auth-client";
import { useRouter } from "@tanstack/react-router";
import { Heart, Loader2, Users, Video, X, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export interface NotificationItem {
  timestamp?: number;
  type?: "friend" | "romantic" | "unmatch";
  text?: string;
  title?: string;
  destroyNotification?: (timestamp: number) => Promise<void>;
}

export type NotificationProps = NotificationItem;

export default function Notification({timestamp, type, text, title, destroyNotification}: NotificationProps) {

  if (!timestamp || !type || !text || !title) {
    return <h4>Invalid Notification</h4>
  }

    const queryClient = useQueryClient();

  let notificationClass : string = "p-4 rounded-xl"
  if (type === "friend") {
    notificationClass += " bg-blue-100";
  } else if (type === "romantic") {
    notificationClass += " bg-pink-100";
  } else if (type === "unmatch") {
    notificationClass += " bg-gray-200";
  }

  return (
    <Card
      key={timestamp}
      className="hover:shadow-md transition-all hover:border-primary py-0 my-1"
    >
      <CardContent className={notificationClass}>
        <div className="flex">
            <h3 className="font-semibold text-base">
                <div className="flex flex-wrap">
                    {type === "friend" ? (<Users></Users>) : type === "romantic" ? (<Heart></Heart>) : type === "unmatch" ? (<X></X>) : (<></>)}
                    {title}
                </div>
            </h3>
            <Button
              size="xs"
              onClick={(e) => {
                queryClient.clear();
                queryClient.invalidateQueries({queryKey: ["session"]});
                if(destroyNotification) { destroyNotification(timestamp); }
              }}
              className="hover:cursor-pointer bg-gray-100 ml-auto"
              disabled={destroyNotification ? false : true}
            >
              <XCircle/>
            </Button>
        </div>
              {/* {type === "friend" ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Users className="w-3 h-3 mr-1" />
                Friend
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                  <Heart className="w-3 h-3 mr-1" />
                  Romantic
                </span>
              )} */}
            <p className="text-sm text-muted-foreground truncate">
              {text}
            </p>
      </CardContent>
    </Card>
  );
}
