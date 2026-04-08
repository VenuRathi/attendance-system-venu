import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/AppLayout";
import { AnimatePresence, motion } from "framer-motion";

import Dashboard from "@/pages/dashboard";
import Lectures from "@/pages/lectures";
import Analytics from "@/pages/analytics";
import Reset from "@/pages/reset";
import AboutUs from "@/pages/about";
import Intro from "@/pages/intro";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function MainRouter() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/lectures" component={Lectures} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/reset" component={Reset} />
        <Route path="/about" component={AboutUs} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [mainVisible, setMainVisible] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  function handleIntroComplete() {
    setShowIntro(false);
    setTimeout(() => setMainVisible(true), 100);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          {showIntro && <Intro onComplete={handleIntroComplete} />}

          <AnimatePresence>
            {mainVisible && (
              <motion.div
                key="main"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="min-h-screen"
              >
                <MainRouter />
              </motion.div>
            )}
          </AnimatePresence>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
