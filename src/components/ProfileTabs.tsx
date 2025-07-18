"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Settings, Github, Mail, Calendar, MapPin, Link as LinkIcon, Save } from "lucide-react"

interface ProfileTabsProps {
  user: {
    id: number
    name: string
    login?: string
    email: string
    image?: string
    bio?: string
    location?: string
    blog?: string
    created_at: string
    public_repos?: number
    followers?: number
    following?: number
  }
  isOwnProfile?: boolean
}

export default function ProfileTabs({ user, isOwnProfile = false }: ProfileTabsProps): JSX.Element {
  const [isEditing, setIsEditing] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: user.name,
    bio: user.bio || "",
    location: user.location || "",
    blog: user.blog || "",
  })

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = (): void => {
    // TODO: 实现保存逻辑
    setIsEditing(false)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            个人资料
          </TabsTrigger>
          {isOwnProfile && (
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              设置
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <div className="grid gap-6">
            {/* 用户基本信息卡片 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <UserAvatar
                    src={user.image || ''}
                    alt={user.name}
                    fallback={user.name.charAt(0)}
                    size="xl"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{user.name}</CardTitle>
                    <CardDescription className="text-lg">@{user.login || 'unknown'}</CardDescription>
                    {user.bio && (
                      <p className="mt-2 text-muted-foreground">{user.bio}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {user.location}
                      </div>
                    )}
                    {user.blog && (
                      <div className="flex items-center gap-1">
                        <LinkIcon className="h-4 w-4" />
                        <a href={user.blog} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {user.blog}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      加入于 {new Date(user.created_at).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Badge variant="secondary" className="px-3 py-1">
                      <Github className="h-4 w-4 mr-1" />
                      {user.public_repos || 0} 个仓库
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">
                      {user.followers || 0} 关注者
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">
                      {user.following || 0} 正在关注
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GitHub 活动统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  GitHub 活动
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground">
                  <p>GitHub 活动数据加载中...</p>
                  <p className="text-sm mt-2">此功能正在开发中</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="settings" className="mt-6">
            <div className="grid gap-6">
              {/* 个人资料设置 */}
              <Card>
                <CardHeader>
                  <CardTitle>个人资料设置</CardTitle>
                  <CardDescription>
                    编辑您的个人资料信息
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">显示名称</Label>
                      <Input
                        id="name"
                        value={isEditing ? formData.name : user.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">个人简介</Label>
                      <Textarea
                        id="bio"
                        value={isEditing ? formData.bio : user.bio || ""}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        disabled={!isEditing}
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">位置</Label>
                      <Input
                        id="location"
                        value={isEditing ? formData.location : user.location || ""}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="blog">网站</Label>
                      <Input
                        id="blog"
                        value={isEditing ? formData.blog : user.blog || ""}
                        onChange={(e) => handleInputChange('blog', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button onClick={handleSave} className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          保存更改
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          取消
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>
                        编辑资料
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 账户设置 - 暂时隐藏 */}
              {/* <Card>
                <CardHeader>
                  <CardTitle>账户设置</CardTitle>
                  <CardDescription>
                    管理您的账户连接和安全设置
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>GitHub 账户</Label>
                      <p className="text-sm text-muted-foreground">
                        已连接到 GitHub (@{user.login || 'unknown'})
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      重新连接
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>删除账户</Label>
                      <p className="text-sm text-muted-foreground">
                        永久删除您的账户和所有数据
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">
                      删除账户
                    </Button>
                  </div>
                </CardContent>
              </Card> */}

              {/* 隐私设置 - 暂时隐藏 */}
              {/* <Card>
                <CardHeader>
                  <CardTitle>隐私设置</CardTitle>
                  <CardDescription>
                    控制您的资料可见性和隐私选项
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>公开个人资料</Label>
                      <p className="text-sm text-muted-foreground">
                        允许其他用户查看您的个人资料
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>显示邮箱地址</Label>
                      <p className="text-sm text-muted-foreground">
                        在个人资料中显示您的邮箱地址
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>显示在排行榜</Label>
                      <p className="text-sm text-muted-foreground">
                        允许在公共排行榜中显示您的信息
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}