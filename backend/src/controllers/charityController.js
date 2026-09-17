import { getSupabaseClient, isMockDatabase, mockDataStore } from '../config/db.js';
import { getStripe } from '../config/stripe.js';
import { ENV } from '../config/env.js';

export class CharityController {
  static async getCharities(req, res, next) {
    try {
      const { search, category, featured } = req.query;
      const supabase = getSupabaseClient();

      if (supabase && !isMockDatabase()) {
        let query = supabase.from('charities').select('*').order('total_raised', { ascending: false });

        if (category && category !== 'All') {
          query = query.eq('category', category);
        }
        if (featured === 'true') {
          query = query.eq('is_featured', true);
        }
        if (search) {
          query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return res.json({ success: true, count: data.length, charities: data });
      }

      let results = [...mockDataStore.charities];

      if (category && category !== 'All') {
        results = results.filter(c => c.category.toLowerCase() === category.toLowerCase());
      }
      if (featured === 'true') {
        results = results.filter(c => c.is_featured);
      }
      if (search) {
        const s = search.toLowerCase();
        results = results.filter(c => c.name.toLowerCase().includes(s) || c.description.toLowerCase().includes(s) || c.tagline.toLowerCase().includes(s));
      }

      return res.json({
        success: true,
        count: results.length,
        charities: results
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCharityBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const supabase = getSupabaseClient();

      if (supabase && !isMockDatabase()) {
        const { data, error } = await supabase.from('charities').select('*').eq('slug', slug).single();
        if (error || !data) {
          return res.status(404).json({ success: false, message: 'Charity not found.' });
        }
        return res.json({ success: true, charity: data });
      }

      const charity = mockDataStore.charities.find(c => c.slug === slug || c.id === slug);
      if (!charity) {
        return res.status(404).json({ success: false, message: 'Charity not found.' });
      }

      return res.json({ success: true, charity });
    } catch (error) {
      next(error);
    }
  }

  static async createDirectDonation(req, res, next) {
    try {
      const { charityId } = req.params;
      const { amount, donorName, donorEmail } = req.body;

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Please provide a valid donation amount greater than 0.' });
      }

      const stripe = getStripe();
      if (stripe && stripe._apiKey) {
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          payment_method_types: ['card'],
          customer_email: donorEmail || undefined,
          line_items: [{
            price_data: {
              currency: 'gbp',
              product_data: {
                name: `Direct Charity Donation`,
                description: `Independent philanthropic contribution through Digital Heroes.`
              },
              unit_amount: Math.round(parsedAmount * 100)
            },
            quantity: 1
          }],
          metadata: { charityId, donorName, donorEmail, type: 'independent_direct' },
          success_url: `${ENV.CLIENT_URL}/charities?donation=success&amount=${parsedAmount}`,
          cancel_url: `${ENV.CLIENT_URL}/charities?donation=canceled`
        });

        return res.json({ success: true, url: session.url });
      }

      // Simulated direct donation
      const donationRecord = {
        id: `don-${Date.now()}`,
        user_id: req.user?.id || null,
        charity_id: charityId,
        amount: parsedAmount,
        source_type: 'independent_direct',
        stripe_payment_intent_id: `pi_sim_${Date.now()}`,
        status: 'succeeded',
        donor_name: donorName || 'Philanthropic Supporter',
        donor_email: donorEmail || 'supporter@digitalheroes.io',
        created_at: new Date().toISOString()
      };

      mockDataStore.donations.push(donationRecord);

      // Increment charity total raised
      const targetCharity = mockDataStore.charities.find(c => c.id === charityId);
      if (targetCharity) {
        targetCharity.total_raised = (parseFloat(targetCharity.total_raised) || 0) + parsedAmount;
      }

      return res.json({
        success: true,
        message: 'Donation recorded successfully. Thank you for your direct support!',
        donation: donationRecord,
        simulated: true
      });
    } catch (error) {
      next(error);
    }
  }
}
