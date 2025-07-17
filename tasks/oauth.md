我们先明确目标：
✅ 成功使用 GitHub OAuth 登录，并打印当前登录用户的用户名与头像
最终是要获取能拿到的所有信息，并存到数据库里面。

Step 1：创建 GitHub OAuth App -- 已完成
Step 2：前端登录按钮  -- 已完成
Step 3：配置环境变量 .env.local  -- 已完成

.env.local 内容：
# GitHub OAuth 应用配置
GITHUB_ID=Ov23lijwUHMF9bpG0KjS
GITHUB_SECRET=c3082e93c0e8b81334ab6f798c553cbba9e72ee5

# NextAuth 配置
NEXTAUTH_SECRET=oEhc9ylMKs1hUpKZeph34Y/wV8fwNfzFPFLZ/KdKRf8=
NEXTAUTH_URL=http://localhost:3000


Step 4：处理回调换取 token -- 待完成
创建一个 API Route：
// pages/api/oauth/callback.ts

export default async function handler(req, res) {
const code = req.query.code as string;

const response = await fetch('https://github.com/login/oauth/access_token', {
method: 'POST',
headers: {
Accept: 'application/json',
'Content-Type': 'application/json'
},
body: JSON.stringify({
client_id: process.env.GITHUB_CLIENT_ID,
client_secret: process.env.GITHUB_CLIENT_SECRET,
code
})
});

const data = await response.json();
const access_token = data.access_token;

// 重定向到前端页面，附带 token
res.redirect(`/user?token=${access_token}`);
}

Step 5：用 token 获取用户数据 -- 待完成

// pages/user.tsx

import { useEffect, useState } from 'react';

export default function User({ token }) {
const [user, setUser] = useState(null);

useEffect(() => {
if (!token) return;
fetch('https://api.github.com/user', {
headers: {
Authorization: `token ${token}`,
}
})
.then(res => res.json())
.then(setUser);
}, [token]);

if (!user) return <div>加载中...</div>;

return (
<div>
<p>用户名：{user.login}</p>
<img src={user.avatar_url} width={100} />
</div>
);
}

// 获取 query 参数中的 token
User.getInitialProps = ({ query }) => ({ token: query.token });
