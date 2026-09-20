import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NewsletterPopup } from "@/components/marketing/NewsletterPopup";
import { Seo } from "@/components/Seo";
import { isHolidayOrderingPaused } from "@shared/storefront-availability";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductPage from "@/pages/Product";
import Checkout from "@/pages/Checkout";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import CheckoutCancel from "@/pages/CheckoutCancel";
import FAQ from "@/pages/FAQ";
import Ingredients from "@/pages/Ingredients";
import ForBusiness from "@/pages/ForBusiness";
import PawsForVenezuela from "@/pages/PawsForVenezuela";
import PawsForVenezuelaThanks from "@/pages/PawsForVenezuelaThanks";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/shop/:id" component={ProductPage} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/checkout/cancel" component={CheckoutCancel} />
      <Route path="/faq" component={FAQ} />
      <Route path="/for-business" component={ForBusiness} />
      <Route path="/catering" component={ForBusiness} />
      <Route path="/ingredients" component={Ingredients} />
      <Route path="/paws-for-venezuela" component={PawsForVenezuela} />
      <Route path="/paws-for-venezuela/thank-you" component={PawsForVenezuelaThanks} />
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
        <Seo />
        {isHolidayOrderingPaused() && (
          <div className="sticky top-0 z-[100] bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground shadow-md sm:text-base">
            We are on holiday until 10 October. Ordering is temporarily unavailable while we prepare to reopen.
          </div>
        )}
        <NewsletterPopup />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
