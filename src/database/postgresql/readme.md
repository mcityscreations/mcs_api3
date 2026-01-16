## Architectural choices with PostgreSQL
I have deliberately moved the integrity of polymorphic relationships to the application layer in order to reduce structural coupling and improve system scalability.
My MariaDB database was a very good example of an 'ultra-normalized' model. It was perfect on the paper but less regarding performance issues.

**Schemes**
- Business entities are stored in a scheme called 'content'.
    content
    ├─ article
    ├─ article_i18n
    ├─ article_keyword
    ├─ artwork
    ├─ artwork_technique
    ├─ artwork_colour
    ├─ artwork_keyword
    ├─ artwork_i18n
    ├─ contact
    ├─ contact_detail
    ├─ media -- Creates the link between content and media files
    ├─ media_i18n
    ├─ people
    
- Taxonomy data(item categories, techniques etc.) is stored in a 'taxonomy' scheme.
    taxonomy
    ├─ category
    ├─ entity -- content entities ex Artwork, Article...
    ├─ keyword
    ├─ status
    ├─ subject
    ├─ technique

- Media data are stored in a dedicated scheme as this set of tables will be stored in a dedicated microservice later.
    media
    ├─ asset
    ├─ type
    ├─ image_size
    ├─ image_variant
    ├─ video_variant -- for mpeg4
    ├─ video_stream -- stream index
    ├─ video_stream_variant -- DASH/HLS stream details
    
- Security data is also stored in a dedicated scheme for the same reason.
    security
    ├─ user