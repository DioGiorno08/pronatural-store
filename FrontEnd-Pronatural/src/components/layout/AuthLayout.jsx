export default function AuthLayout({ leftPanel, children }) {
  return (
    <div className="flex min-h-screen bg-brand-bg font-sans">
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0b2216] overflow-hidden">
        {leftPanel}
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
