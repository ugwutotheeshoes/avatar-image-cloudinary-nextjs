import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from "openai";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_DALL_E_3_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { prompt } = req.body; // Extract prompt and character from request body

    // Generate image using OpenAI
    const generatedImage = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });
    // Extract image URL
    const imageUrl = generatedImage.data[0].url;

    // Generate a unique public ID for Cloudinary
    const timestamp = req.body.prompt + ' ' + Math.floor((Math.random() * 100) + 1);
    const publicId = timestamp.trim().replace(/\s+/g, '-');

    // Upload image to Cloudinary with transformations
    const response = await cloudinary.uploader.upload(imageUrl, {
      transformation: [
        { width: 200, height: 200, gravity: "face", radius: "max", border: "2px_solid_blue", crop: "thumb" }
      ],
      resource_type: 'image',
      public_id: `${publicId}`,
    });

    // Extract uploaded image URL from Cloudinary response
    const uploadedImageUrl = response.secure_url;

    // Send successful response with uploaded image URL
    res.status(200).json({ image_url: uploadedImageUrl });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}
