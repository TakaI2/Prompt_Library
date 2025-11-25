import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { cors } from 'hono/cors'
import postgres from 'postgres'

// Database connection using Supabase connection string
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require'
})

type Prompt = {
  id?: number
  title: string
  prompt: string
  category: string
  tags: string[]
  image_url?: string
  user_id?: string
  created_at?: string
  updated_at?: string
}

type Category = {
  id?: number
  name: string
  color?: string
  icon?: string
  created_at?: string
  updated_at?: string
}

const app = new Hono().basePath('/api')

// Enable CORS
app.use('*', cors())

// Get all prompts with optional filtering
app.get('/prompts', async (c) => {
  const { category, keyword, tag } = c.req.query()

  try {
    let prompts

    if (category && category !== 'すべて' && keyword && tag) {
      prompts = await sql`
        SELECT * FROM prompts
        WHERE category = ${category}
        AND (title ILIKE ${'%' + keyword + '%'} OR prompt ILIKE ${'%' + keyword + '%'})
        AND tags ILIKE ${'%"' + tag + '"%'}
        ORDER BY order_index ASC, created_at DESC
      `
    } else if (category && category !== 'すべて' && keyword) {
      prompts = await sql`
        SELECT * FROM prompts
        WHERE category = ${category}
        AND (title ILIKE ${'%' + keyword + '%'} OR prompt ILIKE ${'%' + keyword + '%'})
        ORDER BY order_index ASC, created_at DESC
      `
    } else if (category && category !== 'すべて' && tag) {
      prompts = await sql`
        SELECT * FROM prompts
        WHERE category = ${category}
        AND tags ILIKE ${'%"' + tag + '"%'}
        ORDER BY order_index ASC, created_at DESC
      `
    } else if (keyword && tag) {
      prompts = await sql`
        SELECT * FROM prompts
        WHERE (title ILIKE ${'%' + keyword + '%'} OR prompt ILIKE ${'%' + keyword + '%'})
        AND tags ILIKE ${'%"' + tag + '"%'}
        ORDER BY order_index ASC, created_at DESC
      `
    } else if (category && category !== 'すべて') {
      prompts = await sql`
        SELECT * FROM prompts
        WHERE category = ${category}
        ORDER BY order_index ASC, created_at DESC
      `
    } else if (keyword) {
      prompts = await sql`
        SELECT * FROM prompts
        WHERE title ILIKE ${'%' + keyword + '%'} OR prompt ILIKE ${'%' + keyword + '%'}
        ORDER BY order_index ASC, created_at DESC
      `
    } else if (tag) {
      prompts = await sql`
        SELECT * FROM prompts
        WHERE tags ILIKE ${'%"' + tag + '"%'}
        ORDER BY order_index ASC, created_at DESC
      `
    } else {
      prompts = await sql`
        SELECT * FROM prompts
        ORDER BY order_index ASC, created_at DESC
      `
    }

    // Parse tags JSON string to array
    const result = prompts.map((row: any) => ({
      ...row,
      tags: JSON.parse(row.tags || '[]')
    }))

    return c.json({ prompts: result })
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return c.json({ error: 'Failed to fetch prompts' }, 500)
  }
})

// Get single prompt by ID
app.get('/prompts/:id', async (c) => {
  const id = c.req.param('id')

  try {
    const result = await sql`SELECT * FROM prompts WHERE id = ${id}`

    if (result.length === 0) {
      return c.json({ error: 'Prompt not found' }, 404)
    }

    const prompt = {
      ...result[0],
      tags: JSON.parse(result[0].tags || '[]')
    }

    return c.json({ prompt })
  } catch (error) {
    console.error('Error fetching prompt:', error)
    return c.json({ error: 'Failed to fetch prompt' }, 500)
  }
})

// Create new prompt
app.post('/prompts', async (c) => {
  try {
    const body = await c.req.json<Prompt>()
    const { title, prompt, category, tags, image_url } = body

    if (!title || !prompt || !category) {
      return c.json({ error: 'Title, prompt, and category are required' }, 400)
    }

    const tagsJson = JSON.stringify(tags || [])

    // Get max order_index and increment
    const maxResult = await sql`SELECT COALESCE(MAX(order_index), 0) as max_order FROM prompts`
    const maxOrder = maxResult[0]?.max_order || 0
    const newOrderIndex = maxOrder + 10

    const result = await sql`
      INSERT INTO prompts (title, prompt, category, tags, image_url, order_index)
      VALUES (${title}, ${prompt}, ${category}, ${tagsJson}, ${image_url || null}, ${newOrderIndex})
      RETURNING id
    `

    return c.json({
      id: result[0].id,
      message: 'Prompt created successfully'
    }, 201)
  } catch (error) {
    console.error('Error creating prompt:', error)
    return c.json({ error: 'Failed to create prompt' }, 500)
  }
})

// Update prompt
app.put('/prompts/:id', async (c) => {
  const id = c.req.param('id')

  try {
    const body = await c.req.json<Prompt>()
    const { title, prompt, category, tags, image_url } = body

    if (!title || !prompt || !category) {
      return c.json({ error: 'Title, prompt, and category are required' }, 400)
    }

    const tagsJson = JSON.stringify(tags || [])

    await sql`
      UPDATE prompts
      SET title = ${title}, prompt = ${prompt}, category = ${category}, tags = ${tagsJson}, image_url = ${image_url || null}, updated_at = NOW()
      WHERE id = ${id}
    `

    return c.json({ message: 'Prompt updated successfully' })
  } catch (error) {
    console.error('Error updating prompt:', error)
    return c.json({ error: 'Failed to update prompt' }, 500)
  }
})

// Delete prompt
app.delete('/prompts/:id', async (c) => {
  const id = c.req.param('id')

  try {
    await sql`DELETE FROM prompts WHERE id = ${id}`
    return c.json({ message: 'Prompt deleted successfully' })
  } catch (error) {
    console.error('Error deleting prompt:', error)
    return c.json({ error: 'Failed to delete prompt' }, 500)
  }
})

// Reorder prompts
app.put('/prompts/reorder', async (c) => {
  try {
    const { promptIds } = await c.req.json<{ promptIds: number[] }>()

    if (!promptIds || !Array.isArray(promptIds)) {
      return c.json({ error: 'Invalid prompt IDs' }, 400)
    }

    // Update order_index for each prompt
    for (let i = 0; i < promptIds.length; i++) {
      const promptId = promptIds[i]
      const orderIndex = (i + 1) * 10
      await sql`UPDATE prompts SET order_index = ${orderIndex} WHERE id = ${promptId}`
    }

    return c.json({ message: 'Prompts reordered successfully' })
  } catch (error) {
    console.error('Error reordering prompts:', error)
    return c.json({ error: 'Failed to reorder prompts' }, 500)
  }
})

// Get all categories
app.get('/categories', async (c) => {
  try {
    const result = await sql`SELECT * FROM categories ORDER BY order_index ASC, id ASC`
    return c.json({ categories: result })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return c.json({ error: 'Failed to fetch categories' }, 500)
  }
})

// Create new category
app.post('/categories', async (c) => {
  try {
    const body = await c.req.json<Category>()
    const { name, color, icon } = body

    if (!name) {
      return c.json({ error: 'Name is required' }, 400)
    }

    // Get max order_index
    const maxResult = await sql`SELECT COALESCE(MAX(order_index), 0) as max_order FROM categories`
    const maxOrder = maxResult[0]?.max_order || 0
    const newOrder = maxOrder + 10

    const result = await sql`
      INSERT INTO categories (name, color, icon, order_index)
      VALUES (${name}, ${color || '#4CD1E0'}, ${icon || 'layer-group'}, ${newOrder})
      RETURNING id
    `

    return c.json({
      id: result[0].id,
      message: 'Category created successfully'
    }, 201)
  } catch (error) {
    console.error('Error creating category:', error)
    return c.json({ error: 'Failed to create category' }, 500)
  }
})

// Update category
app.put('/categories/:id', async (c) => {
  const id = c.req.param('id')

  try {
    const body = await c.req.json<Category>()
    const { name, color, icon } = body

    if (!name) {
      return c.json({ error: 'Name is required' }, 400)
    }

    // Get old category name
    const oldCategory = await sql`SELECT name FROM categories WHERE id = ${id}`

    if (oldCategory.length === 0) {
      return c.json({ error: 'Category not found' }, 404)
    }

    const oldName = oldCategory[0].name

    // Update category
    await sql`
      UPDATE categories
      SET name = ${name}, color = ${color || '#4CD1E0'}, icon = ${icon || 'folder'}, updated_at = NOW()
      WHERE id = ${id}
    `

    // Update all prompts with this category
    if (oldName !== name) {
      await sql`UPDATE prompts SET category = ${name} WHERE category = ${oldName}`
    }

    return c.json({
      message: 'Category updated successfully',
      oldName,
      newName: name
    })
  } catch (error) {
    console.error('Error updating category:', error)
    return c.json({ error: 'Failed to update category' }, 500)
  }
})

// Delete category
app.delete('/categories/:id', async (c) => {
  const id = c.req.param('id')

  try {
    await sql`DELETE FROM categories WHERE id = ${id}`
    return c.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return c.json({ error: 'Failed to delete category' }, 500)
  }
})

// Reorder categories
app.put('/categories/reorder', async (c) => {
  try {
    const { categoryIds } = await c.req.json<{ categoryIds: number[] }>()

    if (!categoryIds || !Array.isArray(categoryIds)) {
      return c.json({ error: 'Invalid category IDs' }, 400)
    }

    // Update order_index for each category
    for (let i = 0; i < categoryIds.length; i++) {
      const categoryId = categoryIds[i]
      const orderIndex = (i + 1) * 10
      await sql`UPDATE categories SET order_index = ${orderIndex} WHERE id = ${categoryId}`
    }

    return c.json({ message: 'Categories reordered successfully' })
  } catch (error) {
    console.error('Error reordering categories:', error)
    return c.json({ error: 'Failed to reorder categories' }, 500)
  }
})

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
