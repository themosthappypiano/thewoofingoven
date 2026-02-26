import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type CheckoutRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Fetch Products
export function useProducts() {
  return useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });
}

// Fetch single product
export function useProduct(id: string | number) {
  return useQuery({
    queryKey: ['/api/products', id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch product");
      return res.json();
    },
    enabled: !!id,
  });
}

// Fetch Reviews
export function useReviews() {
  return useQuery({
    queryKey: ['/api/reviews'],
    queryFn: async () => {
      const res = await fetch('/api/reviews');
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
  });
}

// Checkout Mutation
export function useCheckout() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: CheckoutRequest) => {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Checkout failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: "Pawsome!",
          description: "Your order has been placed successfully.",
          className: "bg-primary text-primary-foreground border-none",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Oops!",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// Contact Mutation
export function useContact() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: { name: string; email: string; message: string }) => {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to send message");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "We'll bark back at you soon.",
        className: "bg-primary text-primary-foreground border-none",
      });
    }
  });
}
