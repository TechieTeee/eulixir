import ChakraWrapper from "@/components/ChakraWrapper";
import Navigation from "@/components/Navigation";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import RoutePreloader from "@/components/RoutePreloader";

export const metadata = {
  title: 'Eulixir - DeFi Analytics Laboratory',
  description: 'Transform raw DeFi data into liquid gold through our mystical ETL laboratory.',
};

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ChakraWrapper>
          <PerformanceMonitor />
          <RoutePreloader />
          <Navigation />
          {children}
        </ChakraWrapper>
      </body>
    </html>
  );
}
