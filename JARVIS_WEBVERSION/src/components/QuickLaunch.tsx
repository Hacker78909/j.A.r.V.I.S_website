export function QuickLaunch() {
  const links = [
    { name: "YouTube", url: "https://youtube.com", color: "bg-red-600" },
    { name: "Netflix", url: "https://netflix.com", color: "bg-red-700" },
    { name: "Crunchyroll", url: "https://crunchyroll.com", color: "bg-orange-600" },
    { name: "Google", url: "https://google.com", color: "bg-blue-600" },
  ];

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Quick Launch</h3>
      <div className="grid grid-cols-2 gap-4">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${link.color} p-4 rounded-lg text-center hover:opacity-90 transition-opacity`}
          >
            {link.name}
          </a>
        ))}
      </div>
    </div>
  );
}
