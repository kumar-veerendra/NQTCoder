import ResourceCategory from '../models/ResourceCategory.js';
import Resource from '../models/Resource.js';

// --- CATEGORY CONTROLLERS ---

/**
 * @desc    Get all resource categories
 * @route   GET /api/resources/categories
 * @access  Private
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await ResourceCategory.find({}).sort({ title: 1 }).lean();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create a resource category
 * @route   POST /api/resources/categories
 * @access  Private/Admin
 */
export const createCategory = async (req, res) => {
  const { title, description, icon, driveFolderLink } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Category Title is required' });
  }

  try {
    const categoryExists = await ResourceCategory.findOne({ title });
    if (categoryExists) {
      return res.status(400).json({ message: 'A category with this title already exists' });
    }

    const category = new ResourceCategory({
      title,
      description,
      icon: icon || 'BookOpen',
      driveFolderLink
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update a resource category
 * @route   PUT /api/resources/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = async (req, res) => {
  try {
    const category = await ResourceCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const { title, description, icon, driveFolderLink } = req.body;
    
    if (title && title !== category.title) {
      const titleExists = await ResourceCategory.findOne({ title });
      if (titleExists) {
        return res.status(400).json({ message: 'A category with this title already exists' });
      }
      category.title = title;
    }

    category.description = description !== undefined ? description : category.description;
    category.icon = icon || category.icon;
    category.driveFolderLink = driveFolderLink !== undefined ? driveFolderLink : category.driveFolderLink;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete a resource category and its nested resources
 * @route   DELETE /api/resources/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = async (req, res) => {
  try {
    const category = await ResourceCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Cascade delete resources under this category
    await Resource.deleteMany({ category: req.params.id });
    await ResourceCategory.deleteOne({ _id: req.params.id });

    res.json({ message: 'Category and all associated resources deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// --- RESOURCE CONTROLLERS ---

/**
 * @desc    Get resources with query, pagination, and filter parameters
 * @route   GET /api/resources
 * @access  Private
 */
export const getResources = async (req, res) => {
  try {
    const { category, resourceType, company, search } = req.query;
    
    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const query = {};

    if (category) {
      query.category = category;
    }

    if (resourceType) {
      query.resourceType = resourceType;
    }

    if (company) {
      query.company = { $regex: new RegExp(company, 'i') };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { tags: { $regex: searchRegex } }
      ];
    }

    const total = await Resource.countDocuments(query);
    
    const resources = await Resource.find(query)
      .populate('category', 'title')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      resources,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create a resource
 * @route   POST /api/resources
 * @access  Private/Admin
 */
export const createResource = async (req, res) => {
  const { 
    title, 
    description, 
    category, 
    resourceType, 
    previewLink, 
    downloadLink, 
    driveFolderLink, 
    thumbnail, 
    tags, 
    company 
  } = req.body;

  if (!title || !category || !resourceType || !previewLink) {
    return res.status(400).json({ message: 'Title, Category, Resource Type, and Preview Link are required' });
  }

  try {
    const categoryExists = await ResourceCategory.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ message: 'Associated category was not found' });
    }

    const resource = new Resource({
      title,
      description,
      category,
      resourceType,
      previewLink,
      downloadLink,
      driveFolderLink,
      thumbnail,
      tags: Array.isArray(tags) ? tags : tags ? tags.split(',').map(t => t.trim()) : [],
      company,
      createdBy: req.user._id
    });

    const createdResource = await resource.save();
    res.status(201).json(createdResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update a resource
 * @route   PUT /api/resources/:id
 * @access  Private/Admin
 */
export const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const { 
      title, 
      description, 
      category, 
      resourceType, 
      previewLink, 
      downloadLink, 
      driveFolderLink, 
      thumbnail, 
      tags, 
      company 
    } = req.body;

    if (category) {
      const categoryExists = await ResourceCategory.findById(category);
      if (!categoryExists) {
        return res.status(404).json({ message: 'Category not found' });
      }
      resource.category = category;
    }

    resource.title = title || resource.title;
    resource.description = description !== undefined ? description : resource.description;
    resource.resourceType = resourceType || resource.resourceType;
    resource.previewLink = previewLink || resource.previewLink;
    resource.downloadLink = downloadLink !== undefined ? downloadLink : resource.downloadLink;
    resource.driveFolderLink = driveFolderLink !== undefined ? driveFolderLink : resource.driveFolderLink;
    resource.thumbnail = thumbnail !== undefined ? thumbnail : resource.thumbnail;
    resource.company = company !== undefined ? company : resource.company;
    
    if (tags !== undefined) {
      resource.tags = Array.isArray(tags) ? tags : tags ? tags.split(',').map(t => t.trim()) : [];
    }

    const updatedResource = await resource.save();
    res.json(updatedResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete a resource
 * @route   DELETE /api/resources/:id
 * @access  Private/Admin
 */
export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    await Resource.deleteOne({ _id: req.params.id });
    res.json({ message: 'Resource removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
