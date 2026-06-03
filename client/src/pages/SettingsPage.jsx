export function SettingsPage() {
  return (
    <section className="rounded-[28px] border border-[var(--border)] bg-[var(--panel)] p-6">
      <h2 className="text-xl font-semibold">设置</h2>
      <p className="mt-2 text-[var(--muted)]">本轮只建立入口。AI 服务配置由后端环境变量管理，前端不提供密钥配置入口。</p>
    </section>
  );
}
