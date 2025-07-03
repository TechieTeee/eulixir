import ChakraWrapper from "@/components/ChakraWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Futura&family=Montserrat:wght@400;600&family=Fira+Code:wght@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ChakraWrapper>{children}</ChakraWrapper>
      </body>
    </html>
  );
}
