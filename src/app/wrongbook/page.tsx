import AppLayout from '@/components/layout/AppLayout';

export default function WrongBookPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-4 pt-8">
        <h2 className="text-2xl font-bold text-[var(--rhythm-neutral-50)]">📖 错题本</h2>
        <div className="mt-8 text-center">
          <div className="text-6xl">📖</div>
          <p className="mt-4 text-lg text-[var(--rhythm-neutral-200)]">错题本空空如也</p>
          <p className="mt-1 text-sm text-[var(--rhythm-neutral-400)]">继续保持，你很棒！</p>
        </div>
      </div>
    </AppLayout>
  );
}
