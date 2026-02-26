import React, { useState, useEffect } from 'react';
import { useCart } from '../../store/use-cart';
import { createCheckoutSession, getShippingRates } from '../../lib/stripe';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Truck, MapPin, AlertCircle } from 'lucide-react';

export function VariantCheckout() {
  const { items, getCartTotal, getShippingRequired, getCollectionOnlyItems, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [shippingRate, setShippingRate] = useState<any>(null);
  const [error, setError] = useState<string>('');
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryType: 'collection' as 'delivery' | 'collection',
    address: '',
    city: '',
    postalCode: '',
    country: 'Ireland',
    distanceKm: '',
    specialInstructions: '',
  });

  const collectionOnlyItems = getCollectionOnlyItems();
  const hasShippableItems = getShippingRequired();
  const hasCakeItems = items.some((item) => item.product?.category === 'cake');
  const subtotal = getCartTotal();

  // Force collection if there are collection-only items
  useEffect(() => {
    if (collectionOnlyItems.length > 0) {
      setFormData(prev => ({ ...prev, deliveryType: 'collection' }));
    }
  }, [collectionOnlyItems.length]);

  // Calculate shipping when delivery details change
  useEffect(() => {
    if (formData.deliveryType === 'delivery') {
      const hasDistance = !hasCakeItems || Number(formData.distanceKm) > 0;
      if (formData.postalCode && formData.city && hasDistance) {
        calculateShipping();
      }
    } else if (formData.deliveryType === 'collection') {
      setShippingRate({ price: 0, name: 'Collection (Free)', delivery_time: 'Next day' });
    }
  }, [formData.deliveryType, formData.postalCode, formData.city, formData.distanceKm, hasCakeItems]);

  const calculateShipping = async () => {
    try {
      const rate = await getShippingRates(
        formData.deliveryType,
        { postalCode: formData.postalCode, city: formData.city, distanceKm: Number(formData.distanceKm) || undefined },
        items
      );
      setShippingRate(rate);
      setError('');
    } catch (err: any) {
      setError(err.message);
      setShippingRate(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const checkoutItems = items.map(item => ({
        productVariantId: item.variant?.id || item.product.id,
        productId: item.variant?.productId || item.product.id,
        productName: item.product.name,
        productCategory: item.product.category,
        price: item.variant?.price || item.product.price,
        imageUrl: item.variant?.imageUrl || item.product.imageUrl,
        shippingRequired: item.variant?.shippingRequired ?? true,
        variantData: item.variant ? {
          id: item.variant.id,
          sku: item.variant.sku,
          name: item.variant.name,
          price: item.variant.price,
          imageUrl: item.variant.imageUrl || item.product.imageUrl,
          shippingRequired: item.variant.shippingRequired ?? true,
        } : undefined,
        quantity: item.quantity,
        customization: item.customization,
      }));

      const checkoutData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        deliveryType: formData.deliveryType,
        shippingAddress: formData.deliveryType === 'delivery' ? {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          distanceKm: Number(formData.distanceKm) || undefined,
        } : undefined,
        specialInstructions: formData.specialInstructions,
        items: checkoutItems,
      };

      const session = await createCheckoutSession(checkoutData);
      
      // In development mode, show success message
      if (session.sessionId === 'mock_session_id') {
        alert(`🎉 Order placed successfully! Order ID: ${session.order.id}\n\nIn production, you would be redirected to Stripe Checkout.`);
        clearCart();
        return;
      }

      // In production, redirect to Stripe
      window.location.href = session.checkoutUrl;

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some delicious treats for your pup!</p>
        <Button onClick={() => window.history.back()}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={`${item.variant?.id || item.product.id}-${JSON.stringify(item.customization)}`} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">{item.variant?.name || 'Default'}</p>
                    {item.customization && (
                      <p className="text-xs text-blue-600">
                        Customization: {JSON.stringify(item.customization)}
                      </p>
                    )}
                    {item.variant && !item.variant.shippingRequired && (
                      <Badge variant="outline" className="text-xs mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        Collection Only
                      </Badge>
                    )}
                    <p className="text-sm">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">€{(Number(item.variant?.price || item.product.price || '0') * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              
              {shippingRate && (
                <div className="flex justify-between">
                  <span>Shipping ({shippingRate.name}):</span>
                  <span>€{(shippingRate.price / 100).toFixed(2)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>€{(subtotal + (shippingRate ? shippingRate.price / 100 : 0)).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {collectionOnlyItems.length > 0 && (
            <Card className="mt-4 border-amber-200 bg-amber-50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Collection Required</p>
                    <p className="text-sm text-amber-700">
                      Your cart contains items that require collection from our Dublin 24 location 
                      (most treats are collection only; delivery is for cakes and Barkday Box delivery only).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Checkout Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Label className={`cursor-pointer p-4 rounded-lg border-2 ${formData.deliveryType === 'collection' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="collection"
                      checked={formData.deliveryType === 'collection'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <div>
                        <div className="font-medium">Collection</div>
                        <div className="text-sm text-gray-600">Dublin 24 - Free</div>
                      </div>
                    </div>
                  </Label>

                  <Label className={`cursor-pointer p-4 rounded-lg border-2 ${
                    formData.deliveryType === 'delivery' 
                      ? 'border-blue-500 bg-blue-50' 
                      : collectionOnlyItems.length > 0 
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed' 
                        : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="delivery"
                      checked={formData.deliveryType === 'delivery'}
                      onChange={handleInputChange}
                      disabled={collectionOnlyItems.length > 0}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      <div>
                        <div className="font-medium">Delivery</div>
                        <div className="text-sm text-gray-600">
                          {collectionOnlyItems.length > 0 ? 'Not available' : 'Dublin only • €0.85/km (cakes)'}
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>

                {formData.deliveryType === 'delivery' && collectionOnlyItems.length === 0 && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="postalCode">Postal Code *</Label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="distanceKm">Delivery Distance (km) {hasCakeItems ? '*' : ''}</Label>
                      <Input
                        id="distanceKm"
                        name="distanceKm"
                        type="number"
                        min="1"
                        step="0.1"
                        value={formData.distanceKm}
                        onChange={handleInputChange}
                        required={hasCakeItems}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Used to calculate cake delivery at €0.85/km (Dublin only).
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleInputChange}
                  placeholder="Any special requests for your order? (e.g., dog's name for personalized cakes)"
                  rows={3}
                />
              </CardContent>
            </Card>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading || !formData.customerName || !formData.customerEmail}
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
