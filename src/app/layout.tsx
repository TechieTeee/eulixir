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
