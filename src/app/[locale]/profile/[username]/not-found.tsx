import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserX, ArrowLeft } from "lucide-react";
import PageLayout from "@/components/PageLayout";

export default function NotFound(): JSX.Element {
  const t = useTranslations();
  
  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <UserX className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">{t("user.profile_not_found")}</CardTitle>
            <CardDescription>
              {t("user.profile_not_found_description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/leaderboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("navigation.back_to_leaderboard")}
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  {t("navigation.back_to_home")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}