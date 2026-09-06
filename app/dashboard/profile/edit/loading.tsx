export default function EditProfileLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Edit Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Update your career information.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-center justify-center py-16 text-sm text-slate-500">
          Loading profile...
        </div>
      </div>
    </div>
  );
}