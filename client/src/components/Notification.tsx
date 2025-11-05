import { Heart, Users, X, XCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

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

  let notificationClass : string = "p-4 rounded-xl overflow-hidden"
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
      className="hover:shadow-md transition-all hover:border-primary py-0 my-1 min-w-[140px]"
    >
      <CardContent className={notificationClass}>
        <div className="flex justify-left">
            <h3 className="font-semibold text-base text-wrap">
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
        <p className="text-sm text-muted-foreground truncate text-wrap">
          {text}
        </p>
      </CardContent>
    </Card>
  );
}
