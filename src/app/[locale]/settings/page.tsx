import PageLayout from "@/components/PageLayout";
import { getTranslations } from "next-intl/server";

export default async function Settings(): Promise<JSX.Element> {
  const t = await getTranslations();
  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold">{t('settings.title')}</h1>
          <p className="text-lg text-muted-foreground mt-2">
            {t('settings.description')}
          </p>
        </div>

        {/* 个人资料设置 */}
        <div className="bg-card border rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">{t('settings.profile.title')}</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t('settings.profile.displayName')}</label>
              <input
                type="text"
                placeholder={t('settings.profile.displayNamePlaceholder')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                defaultValue={t('settings.profile.displayNameDefault')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('settings.profile.tagline')}</label>
              <input
                type="text"
                placeholder={t('settings.profile.taglinePlaceholder')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                defaultValue={t('settings.profile.taglineDefault')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('settings.profile.bio')}</label>
              <textarea
                placeholder={t('settings.profile.bioPlaceholder')}
                rows={4}
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                defaultValue={t('settings.profile.bioDefault')}
              />
            </div>
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-primary text-primary-foreground shadow hover:bg-primary/90">
              {t('settings.profile.saveChanges')}
            </button>
          </div>
        </div>

        {/* 账户设置 - 暂时隐藏 */}
        {/* <div className="bg-card border rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">账户设置</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">GitHub 账户</h3>
                <p className="text-sm text-muted-foreground">已连接到 GitHub</p>
              </div>
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 rounded-md px-3 text-xs border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
                重新连接
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">删除账户</h3>
                <p className="text-sm text-muted-foreground">永久删除您的账户和所有数据</p>
              </div>
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 rounded-md px-3 text-xs bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90">
                删除账户
              </button>
            </div>
          </div>
        </div> */}

        {/* 隐私设置 - 暂时隐藏 */}
        {/* <div className="bg-card border rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">隐私设置</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">公开个人资料</h3>
                <p className="text-sm text-muted-foreground">允许其他用户查看您的个人资料</p>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">显示邮箱地址</h3>
                <p className="text-sm text-muted-foreground">在个人资料中显示您的邮箱地址</p>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-5"></span>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </PageLayout>
  );
} 