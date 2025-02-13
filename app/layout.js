import "./globals.css";

export const metadata = {
  title: "No Jelly Leg - Cycle Group",
  description: "By SHINE Six",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
