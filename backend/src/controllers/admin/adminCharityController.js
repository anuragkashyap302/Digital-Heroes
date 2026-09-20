import { getSupabaseClient, isMockDatabase, mockDataStore } from '../../config/db.js';

export class AdminCharityController {
  static async createCharity(req, res, next) {
    try {
      const { name, category, tagline, description, logo_url, banner_url, website_url, is_featured, upcoming_events } = req.body;

      if (!name || !category || !description) {
        return res.status(400).json({ success: false, message: 'Charity name, category, and description are required.' });
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const supabase = getSupabaseClient();

      if (supabase && !isMockDatabase()) {
        const { data, error } = await supabase.from('charities').insert({
          name,
          slug,
          category,
          tagline: tagline || name,
          description,
          logo_url: logo_url || 'https://images.unsplash.com/photo-1593111774642-a164b58e7784?auto=format&fit=crop&w=400&q=80',
          banner_url: banner_url || 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80',
          website_url: website_url || '',
          total_raised: 0.00,
          is_featured: !!is_featured,
          upcoming_events: upcoming_events || []
        }).select().single();

        if (error) throw error;
        return res.status(201).json({ success: true, message: 'Charity created successfully.', charity: data });
      }

      const charityData = {
        id: `charity-${Date.now()}`,
        name,
        slug,
        category,
        tagline: tagline || name,
        description,
        logo_url: logo_url || 'https://images.unsplash.com/photo-1593111774642-a164b58e7784?auto=format&fit=crop&w=400&q=80',
        banner_url: banner_url || 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80',
        website_url: website_url || '',
        total_raised: 0.00,
        is_featured: !!is_featured,
        upcoming_events: upcoming_events || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockDataStore.charities.push(charityData);
      return res.status(201).json({ success: true, message: 'Charity created successfully.', charity: charityData });
    } catch (error) {
      next(error);
    }
  }

  static async updateCharity(req, res, next) {
    try {
      const { id } = req.params;
      const { name, category, tagline, description, logo_url, banner_url, website_url, is_featured, upcoming_events } = req.body;

      const supabase = getSupabaseClient();
      if (supabase && !isMockDatabase()) {
        const updatePayload = {
          ...(name && { name }),
          ...(category && { category }),
          ...(tagline && { tagline }),
          ...(description && { description }),
          ...(logo_url && { logo_url }),
          ...(banner_url && { banner_url }),
          ...(website_url && { website_url }),
          ...(is_featured !== undefined && { is_featured: !!is_featured }),
          ...(upcoming_events !== undefined && { upcoming_events }),
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase.from('charities').update(updatePayload).eq('id', id).select().single();
        if (error) throw error;
        return res.json({ success: true, message: 'Charity updated successfully.', charity: data });
      }

      const charity = mockDataStore.charities.find(c => c.id === id);
      if (!charity) {
        return res.status(404).json({ success: false, message: 'Charity not found.' });
      }

      if (name) charity.name = name;
      if (category) charity.category = category;
      if (tagline) charity.tagline = tagline;
      if (description) charity.description = description;
      if (logo_url) charity.logo_url = logo_url;
      if (banner_url) charity.banner_url = banner_url;
      if (website_url) charity.website_url = website_url;
      if (is_featured !== undefined) charity.is_featured = !!is_featured;
      if (upcoming_events !== undefined) charity.upcoming_events = upcoming_events;
      charity.updated_at = new Date().toISOString();

      return res.json({ success: true, message: 'Charity updated successfully.', charity });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCharity(req, res, next) {
    try {
      const { id } = req.params;
      const supabase = getSupabaseClient();

      if (supabase && !isMockDatabase()) {
        const { error } = await supabase.from('charities').delete().eq('id', id);
        if (error) throw error;
        return res.json({ success: true, message: 'Charity deleted successfully.' });
      }

      mockDataStore.charities = mockDataStore.charities.filter(c => c.id !== id);
      return res.json({ success: true, message: 'Charity deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}
