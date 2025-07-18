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
import { User, Settings, Github, Mail, Calendar, MapPin, Link as LinkIcon, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { ProfileUpdateRequest, ProfileApiResponse } from "@/types/profile"

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
  const [isSaving, setIsSaving] = React.useState(false)
  const [currentUser, setCurrentUser] = React.useState(user)
  const [formData, setFormData] = React.useState({
    name: user.name,
    bio: user.bio || "",
    location: user.location || "",
    blog: user.blog || "",
  })

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const handleCancel = (): void => {
    // 重置表单数据到当前用户数据
    setFormData({
      name: currentUser.name,
      bio: currentUser.bio || "",
      location: currentUser.location || "",
      blog: currentUser.blog || "",
    })
    setIsEditing(false)
  }

  const handleSave = async (): Promise<void> => {
    try {
      setIsSaving(true)
      
      // 准备请求数据
      const profileData: ProfileUpdateRequest = {
        name: formData.name.trim(),
        bio: formData.bio.trim() || undefined,
        location: formData.location.trim() || undefined,
        blog: formData.blog.trim() || undefined,
      }
      
      // 调用个人资料更新API
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })
      
      const result: ProfileApiResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || '保存失败')
      }
      
      // 更新本地用户数据
      const updatedUserData = {
        ...currentUser,
        name: profileData.name,
        bio: profileData.bio,
        location: profileData.location,
        blog: profileData.blog,
      }
      
      setCurrentUser(updatedUserData)
      setIsEditing(false)
      
      // 显示成功提示
      toast.success('个人资料更新成功！')
      
    } catch (error) {
      console.error('保存个人资料失败:', error)
      const errorMessage = error instanceof Error ? error.message : '保存失败，请重试'
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className={`grid w-full ${isOwnProfile ? 'grid-cols-2' : 'grid-cols-1'}`}>
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
                    src={currentUser.image || ''}
                    alt={currentUser.name}
                    fallback={currentUser.name.charAt(0)}
                    size="xl"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{currentUser.name}</CardTitle>
                    <CardDescription className="text-lg">@{currentUser.login || 'unknown'}</CardDescription>
                    {currentUser.bio && (
                      <p className="mt-2 text-muted-foreground">{currentUser.bio}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {currentUser.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {currentUser.location}
                      </div>
                    )}
                    {currentUser.blog && (
                      <div className="flex items-center gap-1">
                        <LinkIcon className="h-4 w-4" />
                        <a href={currentUser.blog} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {currentUser.blog}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {currentUser.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      加入于 {new Date(currentUser.created_at).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Badge variant="secondary" className="px-3 py-1">
                      <Github className="h-4 w-4 mr-1" />
                      {currentUser.public_repos || 0} 个仓库
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">
                      {currentUser.followers || 0} 关注者
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">
                      {currentUser.following || 0} 正在关注
                    </Badge>
                  </div>
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
                        value={isEditing ? formData.name : currentUser.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditing || isSaving}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">个人简介</Label>
                      <Textarea
                        id="bio"
                        value={isEditing ? formData.bio : currentUser.bio || ""}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        disabled={!isEditing || isSaving}
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">位置</Label>
                      <Input
                        id="location"
                        value={isEditing ? formData.location : currentUser.location || ""}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        disabled={!isEditing || isSaving}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="blog">网站</Label>
                      <Input
                        id="blog"
                        value={isEditing ? formData.blog : currentUser.blog || ""}
                        onChange={(e) => handleInputChange('blog', e.target.value)}
                        disabled={!isEditing || isSaving}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button 
                          onClick={handleSave} 
                          className="flex items-center gap-2"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          {isSaving ? '保存中...' : '保存更改'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={handleCancel}
                          disabled={isSaving}
                        >
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