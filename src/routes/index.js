import express from 'express';
import { isValidUrl, detectContentType } from '../utils/urlParser.js';
import { fetchNote, fetchUser, fetchInstanceMeta, fetchInstanceNotes, fetchUserNotes } from '../services/misskeyClient.js';
import { sanitizeNoteContent, stripHtml, truncateText } from '../utils/sanitizer.js';
import { generateOgImage } from '../services/ogImageGenerator.js';

const router = express.Router();

/**
 * Home page
 */
router.get('/', (req, res) => {
  res.render('home', {
    title: 'vxsharkey',
  });
});

/**
 * URL resolver endpoint
 */
router.get('/resolve', async (req, res, next) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).render('error', {
        title: 'Error',
        error: {
          statusCode: 400,
          message: 'URL parameter is required',
        },
      });
    }

    if (!isValidUrl(url)) {
      return res.status(400).render('error', {
        title: 'Error',
        error: {
          statusCode: 400,
          message: 'Invalid or unsafe URL',
        },
      });
    }

    const detection = detectContentType(url);

    switch (detection.type) {
      case 'note':
        return res.redirect(`/instance/${detection.domain}/notes/${detection.id}`);
      case 'profile':
        return res.redirect(`/profile/${detection.domain}/${detection.username || detection.userId}`);
      case 'instance':
        return res.redirect(`/instance/${detection.domain}`);
      default:
        return res.status(400).render('error', {
          title: 'Error',
          error: {
            statusCode: 400,
            message: 'Could not detect content type',
          },
        });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Raw URL redirect (alternative format)
 */
router.get('/raw/*', (req, res) => {
  const url = req.params[0];
  res.redirect(`/resolve?url=${encodeURIComponent(url)}`);
});

/**
 * Instance page
 */
router.get('/instance/:domain', async (req, res, next) => {
  try {
    const { domain } = req.params;

    const [meta, notes] = await Promise.all([
      fetchInstanceMeta(domain),
      fetchInstanceNotes(domain, 20),
    ]);

    res.render('instance', {
      title: `${meta.name || domain} - vxsharkey`,
      domain,
      meta,
      notes: notes || [],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Note page (primary feature)
 */
router.get('/instance/:domain/notes/:noteId', async (req, res, next) => {
  try {
    const { domain, noteId } = req.params;

    const note = await fetchNote(domain, noteId);

    if (!note) {
      return res.status(404).render('error', {
        title: 'Not Found',
        error: {
          statusCode: 404,
          message: 'Note not found',
        },
      });
    }

    // Prepare OpenGraph data
    const ogData = {
      title: `${note.user.name || note.user.username} on ${domain}`,
      description: truncateText(stripHtml(note.text || ''), 200),
      url: `https://${domain}/notes/${noteId}`,
      image: null,
      type: 'article',
      siteName: 'vxsharkey',
    };

    // Get image for OG
    if (note.files && note.files.length > 0) {
      if (note.files.length === 1) {
        ogData.image = note.files[0].thumbnailUrl || note.files[0].url;
      } else {
        // Generate composite image for multiple files
        try {
          ogData.image = await generateOgImage(note, domain);
        } catch (err) {
          console.error('Failed to generate OG image:', err);
          ogData.image = note.files[0].thumbnailUrl || note.files[0].url;
        }
      }
    } else {
      // Generate card image
      try {
        ogData.image = await generateOgImage(note, domain);
      } catch (err) {
        console.error('Failed to generate OG image:', err);
      }
    }

    res.render('note', {
      title: `${note.user.name || note.user.username} - vxsharkey`,
      domain,
      noteId,
      note,
      ogData,
      sanitizeNoteContent,
      stripHtml,
      truncateText,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Profile page
 */
router.get('/profile/:domain/:username', async (req, res, next) => {
  try {
    const { domain, username } = req.params;

    const user = await fetchUser(domain, username);

    if (!user) {
      return res.status(404).render('error', {
        title: 'Not Found',
        error: {
          statusCode: 404,
          message: 'User not found',
        },
      });
    }

    const notes = await fetchUserNotes(domain, user.id, 20);

    res.render('profile', {
      title: `${user.name || user.username} - vxsharkey`,
      domain,
      user,
      notes: notes || [],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Discord embed API endpoint
 */
router.get('/api/discord-embed/:domain/notes/:noteId', async (req, res, next) => {
  try {
    const { domain, noteId } = req.params;

    const note = await fetchNote(domain, noteId);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const embed = {
      author: {
        name: note.user.name || note.user.username,
        icon_url: note.user.avatarUrl,
      },
      description: truncateText(stripHtml(note.text || ''), 2000),
      color: 3447003, // Blue color
      timestamp: note.createdAt,
      footer: {
        text: '🦈 vxsharkey • by m5rcode',
      },
      fields: [],
    };

    // Add attachments
    if (note.files && note.files.length > 0) {
      if (note.files[0].type.startsWith('image')) {
        embed.image = {
          url: note.files[0].url,
        };
      }

      if (note.files.length > 1) {
        embed.fields.push({
          name: 'Attachments',
          value: `${note.files.length} files attached`,
        });
      }
    }

    // Add quote info if present
    if (note.renote && note.text) {
      embed.fields.push({
        name: 'Quoting',
        value: `@${note.renote.user.username}: ${truncateText(stripHtml(note.renote.text || ''), 100)}`,
      });
    }

    res.json({ embeds: [embed] });
  } catch (error) {
    next(error);
  }
});

/**
 * OG Image endpoint
 */
router.get('/og-image/:domain/notes/:noteId', async (req, res, next) => {
  try {
    const { domain, noteId } = req.params;

    const note = await fetchNote(domain, noteId);

    if (!note) {
      return res.status(404).send('Note not found');
    }

    const imageBuffer = await generateOgImage(note, domain);

    if (!imageBuffer) {
      return res.status(500).send('Failed to generate image');
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(imageBuffer);
  } catch (error) {
    next(error);
  }
});

export { router as urlRouter };
