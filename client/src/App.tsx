import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductPage from "@/pages/Product";
import Checkout from "@/pages/Checkout";
import FAQ from "@/pages/FAQ";
import Ingredients from "@/pages/Ingredients";
import ForBusiness from "@/pages/ForBusiness";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/shop/:id" component={ProductPage} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/faq" component={FAQ} />
      <Route path="/for-business" component={ForBusiness} />
      <Route path="/catering" component={ForBusiness} />
      <Route path="/ingredients" component={Ingredients} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
