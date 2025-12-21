# 操作按钮权限控制分析

## 📋 权限控制概览

当前系统采用**两级权限控制机制**：
1. **全局管理权限**：控制是否显示管理类操作按钮
2. **组件级权限**：通过 RDC 的 `admins` 字段管理每个组件的管理员列表

---

## 🔐 权限控制实现

### 1. 全局管理权限 (`canManage`)

**位置**: `packages/host/src/pages/Component/index.tsx:151`

```typescript
const canManage = userInfo?.roles?.isSuperAdmin === true
```

**权限判断逻辑**：
- ✅ **基于角色权限**：通过检查 `userInfo.roles.isSuperAdmin` 来判断是否有管理权限
- ✅ **获取方式**：通过 `fetchUserInfo()` API 获取当前登录用户信息（包含 `roles` 字段）
- ✅ **灵活性**：权限由后端 API 返回，无需硬编码用户名

**受控的操作**：
- ✅ "新增组件" 按钮（页面头部）
- ✅ "权限" 按钮（组件列表操作列）
- ✅ "删除" 按钮（组件列表操作列）
- ✅ "更多" 按钮（组件列表操作列，包含上线/下线功能）

**不受控的操作**：
- ❌ "编辑" 按钮（所有用户都可以看到和点击）

---

### 2. 按钮显示逻辑

**位置**: `packages/host/src/pages/Component/components/ComponentTable.tsx:149`

```typescript
{canManage && (
  <>
    <button onClick={() => onPermission(component.componentName)}>权限</button>
    <button onClick={() => onDelete(component.componentName)}>删除</button>
    <button onClick={() => handleToggleMenu(index)}>更多</button>
  </>
)}
```

**权限控制流程**：

```
用户登录
  ↓
获取用户信息 (fetchUserInfo) → /nodeapi/userInfo
  ↓
检查 userInfo.roles.isSuperAdmin === true
  ↓
设置 canManage = true/false
  ↓
传递给 ComponentTable 组件
  ↓
条件渲染操作按钮
```

---

## 📊 权限控制详细分析

### 操作按钮权限矩阵

| 操作按钮 | 权限控制 | 控制方式 | 代码位置 |
|---------|---------|---------|---------|
| **编辑** | ❌ 无权限控制 | 所有用户可见 | `ComponentTable.tsx:141` |
| **权限** | ✅ `canManage` | 仅 `mashilei` 可见 | `ComponentTable.tsx:149-158` |
| **删除** | ✅ `canManage` | 仅 `mashilei` 可见 | `ComponentTable.tsx:149-167` |
| **更多** | ✅ `canManage` | 仅 `mashilei` 可见 | `ComponentTable.tsx:149-197` |
| **上线/下线** | ✅ `canManage` | 仅 `mashilei` 可见（在"更多"下拉中） | `ComponentTable.tsx:183` |
| **新增组件** | ✅ `canManage` | 仅 `mashilei` 可见 | `index.tsx:189` |

---

## 🔍 代码流程分析

### 1. 用户信息获取

```typescript
// index.tsx:64-68
useEffect(() => {
  const loadUserInfo = async () => {
    const user = await fetchUserInfo()
    setUserInfo(user)
  }
  loadUserInfo()
}, [])
```

**API 调用**: `fetchUserInfo()` → `/nodeapi/userInfo`

**返回数据结构**：
```typescript
{
  id: number
  login: string
  name: string
  email: string
  code: string
  tenantId: number
  isVerified: number
  verifyType: string
  verifyExpireTime: number
  passport: string
  type: number
  subjectType: string
  roles?: {
    isSuperAdmin?: boolean  // 超级管理员标识
  }
}
```

---

### 2. 权限判断

```typescript
// index.tsx:151
const canManage = userInfo?.login === 'mashilei'
```

**判断逻辑**：
- 如果 `userInfo` 存在且 `roles.isSuperAdmin === true`，则 `canManage = true`
- 否则 `canManage = false`

---

### 3. 权限传递

```typescript
// index.tsx:204-215
<ComponentTable
  components={components}
  loading={loading}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onPermission={handleOpenPermissionModal}
  onUpdateStatus={async (componentName, status) => {
    await updateComponentStatus(componentName, status)
  }}
  deleting={deleting}
  canManage={canManage}  // ← 权限标志传递
/>
```

---

### 4. 按钮条件渲染

```typescript
// ComponentTable.tsx:139-200
<td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-center">
  <div className="flex items-center justify-center gap-4">
    {/* 编辑按钮 - 无权限控制 */}
    <button onClick={() => onEdit(component)}>编辑</button>
    
    {/* 管理类按钮 - 需要 canManage 权限 */}
    {canManage && (
      <>
        <button onClick={() => onPermission(component.componentName)}>权限</button>
        <button onClick={() => onDelete(component.componentName)}>删除</button>
        <button onClick={() => handleToggleMenu(index)}>更多</button>
      </>
    )}
  </div>
</td>
```

---

## ⚠️ 潜在问题

### 1. **权限检查（已优化）**

**当前实现**：
```typescript
const canManage = userInfo?.roles?.isSuperAdmin === true
```

**优点**：
- ✅ 基于角色权限系统，更加灵活
- ✅ 权限由后端 API 控制，无需修改前端代码
- ✅ 支持动态权限管理

**注意事项**：
- ⚠️ 需要确保后端 API 正确返回 `roles.isSuperAdmin` 字段
- ⚠️ 如果 API 返回的数据结构不一致，可能导致权限判断失效

---

### 2. **"编辑"按钮无权限控制**

**问题**：
```typescript
// ComponentTable.tsx:141-148
<button onClick={() => onEdit(component)}>编辑</button>
// 没有 canManage 检查
```

**影响**：
- ❌ 所有用户都可以编辑组件版本
- ❌ 可能导致未授权修改

**建议**：
- 添加权限检查：`{canManage && <button>编辑</button>}`
- 或根据组件级权限（`admins`）控制

---

### 3. **缺少组件级权限检查**

**当前实现**：
- 只有全局 `canManage` 权限
- 没有检查当前用户是否在组件的 `admins` 列表中

**建议**：
- 在操作前检查当前用户是否在 `rdcInfo.admins` 中
- 实现更细粒度的权限控制

---

## 🔧 优化建议

### 1. 改进权限判断逻辑

```typescript
// 建议的改进方案
const ADMIN_USERS = ['mashilei', 'peizhifei'] // 从配置文件或 API 获取
const canManage = userInfo?.login && ADMIN_USERS.includes(userInfo.login)
```

或从 API 获取：
```typescript
const canManage = await checkUserPermission(userInfo?.login)
```

---

### 2. 添加组件级权限检查

```typescript
// 检查用户是否有权限操作特定组件
const canManageComponent = useCallback(async (componentName: string) => {
  if (!userInfo?.login) return false
  
  // 全局管理员
  if (canManage) return true
  
  // 检查组件级权限
  const rdcInfo = await fetchRdcInfo(componentName)
  return rdcInfo?.admins?.includes(userInfo.login) || false
}, [userInfo, canManage])
```

---

### 3. 统一权限管理

创建权限管理 Hook：
```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  
  const hasPermission = (permission: string) => {
    return permissions.includes(permission)
  }
  
  const canManageComponent = async (componentName: string) => {
    // 检查全局权限或组件级权限
  }
  
  return { userInfo, hasPermission, canManageComponent }
}
```

---

## 📝 总结

### 当前权限控制特点

✅ **优点**：
- 实现简单，易于理解
- 权限控制集中在一个地方

❌ **缺点**：
- "编辑"按钮无权限控制
- 缺少组件级权限检查
- 依赖后端 API 返回正确的权限字段

### 权限控制流程图

```
用户访问页面
  ↓
获取用户信息 (fetchUserInfo) → /nodeapi/userInfo
  ↓
检查 userInfo.roles.isSuperAdmin === true
  ↓
canManage = true/false
  ↓
传递给 ComponentTable
  ↓
条件渲染按钮
  ├─ 编辑：始终显示
  ├─ 权限：canManage && 显示
  ├─ 删除：canManage && 显示
  └─ 更多：canManage && 显示
```

---

## 🔗 相关文件

- **权限判断**: `packages/host/src/pages/Component/index.tsx:151`
- **按钮渲染**: `packages/host/src/pages/Component/components/ComponentTable.tsx:149`
- **用户信息获取**: `packages/host/src/pages/Component/api/componentApi.ts:fetchUserInfo`
- **组件权限管理**: `packages/host/src/pages/Component/hooks/usePermissions.ts`

