export default function NotificationBox() {
  const dummyNotifications = [
    "New tea supply request",
    "Trip completed",
    "Message from manager"
  ];

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded p-3 z-50">
      <h4 className="font-bold mb-2">Notifications</h4>
      <ul className="space-y-1 text-sm">
        {dummyNotifications.map((note, index) => (
          <li key={index} className="border-b py-1">{note}</li>
        ))}
      </ul>
    </div>
  );
}
