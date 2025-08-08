@@ .. @@
-import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
+// Supabase Edge Function to notify admin of new orders
+import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 }

+/**
+ * Edge function to handle order notifications to admin
+ * Processes order data and logs detailed information for admin review
+ */
 serve(async (req) => {
   // Handle CORS preflight requests
   if (req.method === 'OPTIONS') {
     return new Response('ok', { headers: corsHeaders })
   }

   try {
+    // Extract order data from request
     const { orderData, userInfo, cartItems } = await req.json()

     // Here you would typically send an email or push notification
     // For now, we'll log the order details and return success
     const orderNotification = {
       orderData,
       userInfo,
       cartItems,
       timestamp: new Date().toISOString(),
       contactInfo: {
         whatsappNumber: orderData.shippingAddress?.whatsapp_number,
         pickupLocation: orderData.shippingAddress?.pickup_location,
         city: orderData.shippingAddress?.city,
         state: orderData.shippingAddress?.state
       }
     }
     
+    // Log detailed order information for admin
     console.log('=== NEW ORDER NOTIFICATION ===')
     console.log('Order ID:', orderData.orderId)
     console.log('Customer:', userInfo.fullName, '(' + userInfo.email + ')')
     console.log('WhatsApp:', orderNotification.contactInfo.whatsappNumber)
     console.log('Pickup Location:', orderNotification.contactInfo.pickupLocation)
     console.log('City/State:', orderNotification.contactInfo.city + ', ' + orderNotification.contactInfo.state)
     console.log('Total Amount:', orderData.totalAmount)
     console.log('Items:', cartItems.length)
     cartItems.forEach((item, index) => {
       console.log(`  ${index + 1}. ${item.productName} (Qty: ${item.quantity}) - ₦${item.totalPrice}`)
     })
     console.log('==============================')

     // In a real implementation, you might:
     // 1. Send an email using a service like SendGrid, Resend, or Supabase's email service
     // 2. Send a push notification
     // 3. Create a notification record in the database
     // 4. Send a webhook to external services

     // For demonstration, we'll simulate a successful notification
     const notificationResult = {
       success: true,
       message: 'Order submitted successfully! Admin has been notified and will contact you via WhatsApp shortly.',
       orderId: orderData.orderId,
       timestamp: new Date().toISOString(),
       contactMethod: 'WhatsApp: ' + orderNotification.contactInfo.whatsappNumber
     }

     return new Response(
       JSON.stringify(notificationResult),
       {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 200,
       },
     )
   } catch (error) {
     console.error('Error processing notification:', error)
     
     return new Response(
       JSON.stringify({ 
         success: false, 
         error: 'Failed to notify admin',
         message: error.message 
       }),
       {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 500,
       },
     )
   }
 })