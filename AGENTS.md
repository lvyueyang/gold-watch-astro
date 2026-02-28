# 项目开发指南 (Agents.md)

本文档旨在为开发人员（及 AI 辅助编程 Agents）提供本项目的技术栈规范、编码风格与开发流程指南。所有代码贡献需严格遵循以下约定。

## 1. 技术栈概览

- **运行时/部署平台**: [Cloudflare Workers](https://workers.cloudflare.com/) (Standard) + [Cloudflare Pages](https://pages.cloudflare.com/)
- **核心框架**: [Astro](https://astro.build/) (SSR Mode, adapter: `@astrojs/cloudflare`)
- **前端框架**: [React](https://react.dev/) + TSX
- **UI 组件库**: [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS
- **编程语言**: [TypeScript](https://www.typescriptlang.org/)
- **包管理器**: [pnpm](https://pnpm.io/)
- **代码规范/格式化**: [Biome](https://biomejs.dev/)

## 2. 工程规范

### 2.1 包管理

- **必须**使用 `pnpm` 进行依赖安装与管理。
- 禁止使用 `npm` 或 `yarn`，以免生成冲突的 lock 文件。
- 安装依赖示例：`pnpm add @astrojs/tailwind lucide-react @radix-ui/react-dialog`。

### 2.2 代码风格 (Biome)

- 本项目**仅**使用 Biome 进行代码格式化（Formatter）与静态分析（Linter）。
- 禁止引入 `Prettier` 或 `ESLint`，以保持工具链简洁。
- **配置文件**: `biome.json` (位于根目录)。

### 2.3 文件命名

- **React 组件**: PascalCase，如 `PriceChart.tsx`。
- **Astro 页面**: kebab-case 或小写，如 `index.astro`, `admin-login.astro`。
- **工具函数/Hooks**: camelCase，如 `usePrice.ts`, `formatDate.ts`。
- **常量/配置**: CONSTANT_CASE 或 camelCase，视上下文而定。

## 3. 架构与目录结构

```
/
├── public/              # 静态资源
├── src/
│   ├── components/      # React 组件 (UI)
│   ├── layouts/         # Astro 布局
│   ├── pages/           # 页面路由 (Astro/React)
│   │   ├── api/         # API 路由 (Cloudflare Workers)
│   │   └── admin/       # 管理后台页面
│   ├── lib/             # 核心逻辑 (规则引擎, D1, KV)
│   │   ├── db.ts        # D1 数据库连接与 Schema
│   │   ├── kv.ts        # KV 存取封装
│   │   └── engine.ts    # 规则引擎逻辑
│   └── env.d.ts         # 环境变量类型定义
├── docs/                # 设计文档
├── wrangler.jsonc       # Cloudflare 配置
├── biome.json           # Biome 配置
└── package.json
```

## 4. 数据库与存储 (D1 + KV)

- **D1 (Relational)**:
  - 用于存储结构化业务数据：`rules` (规则表)。
  - **禁止**在 D1 中存储高频更新的临时状态（如秒级 tick），除非必要。
  - SQL 变更需记录在 `docs/sql/` 或通过 Migration 管理。

- **KV (Key-Value)**:
  - 用于存储配置与敏感信息：Webhook URL, Admin Password。
  - Key 命名规范：大写下划线，如 `WEBHOOK_FEISHU`, `ADMIN_USER`。
  - 读写操作应封装在 `src/lib/kv.ts` 中，避免散落在业务代码里。

## 5. 前端开发规范 (React + shadcn/ui)

- **组件引入**: 在 `.astro` 文件中使用 React 组件时，必须添加 `client:*` 指令（通常用 `client:load` 或 `client:only="react"`），否则组件将无法交互。
  ```astro
  <PriceMonitor client:load />
  ```
- **shadcn/ui 集成**:
  - 使用 Tailwind CSS 进行样式定制。
  - 组件按需拷贝到 `src/components/ui/`，可自由修改。
- **状态管理**: 简单状态使用 `useState`/`useReducer`，全局状态可使用 React Context 或 Nano Stores（Astro 推荐）。
- **表单处理**: 使用 [@tanstack/react-form](https://tanstack.com/form/latest/docs/installation) 进行表单状态管理与校验。
- **异步状态与数据获取**: 使用 [@tanstack/react-query](https://tanstack.com/query/latest/docs/framework/react/quick-start) 管理服务端状态（Queries/Mutations）与缓存。

## 6. 开发与部署流程

1.  **启动本地开发**:

    ```bash
    pnpm dev
    ```

    _注意：涉及 D1/KV 的本地开发需确保 Wrangler 绑定生效。_

2.  **类型生成**:

    ```bash
    pnpm cf-typegen
    ```

    _当修改 `wrangler.jsonc` 后运行，更新 `worker-configuration.d.ts`。_

3.  **代码检查**:

    ```bash
    pnpm biome check .
    ```

4.  **部署**:
    ```bash
    pnpm run deploy
    ```
    _部署到 Cloudflare Workers/Pages。_

## 7. 补充说明

- **注释**: 核心逻辑（尤其是规则判定逻辑）必须包含清晰的注释。
- **错误处理**: API 接口必须返回统一的错误结构，避免直接抛出 500 堆栈信息给前端。
- **无状态**: 牢记 Worker 是无状态的，不要在全局变量中存储会话状态。
