## Architectural choices with PostgreSQL
I wanted to apply the CQRS pattern (Command Query Responsibility Segregation) to preserve data integrity through a  normalized data structure and to simplify reading queries with the Materialized Views provided by Postgresql. The use of JSONB columns inside the Materialized Views bring order into complex views. Content is also indexable with GIN indexes which enables faster search queries. Materialized Views were chosen as once published, the content of my website mcitys.com evolves rarely and content is not added every second but rather once a week.

**Least privilege** The access to a given schema is limited to specific users only. This solution provides a new layer of security and also enable scalability as it prepares a future migration from a monolithic structure to a microservices architecture.

**Schemes**
- Business entities are stored in a schema called 'content'.
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
    
- Taxonomy data(item categories, techniques etc.) is stored in a 'taxonomy' schema.
    taxonomy
    ├─ category
    ├─ entity -- content entities ex Artwork, Article...
    ├─ keyword
    ├─ status
    ├─ subject
    ├─ technique

- Media data are stored in a dedicated schema as this set of tables will be stored in a dedicated microservice later.
    media
    ├─ asset
    ├─ type
    ├─ image_size
    ├─ image_variant
    ├─ video_variant -- for mpeg4
    ├─ video_stream -- stream index
    ├─ video_stream_variant -- DASH/HLS stream details
    
- Security data is also stored in a dedicated schema for the same reason.
    security
    ├─ user

```
graph TD
    %% Définition des Schémas (Containers)
    subgraph taxonomy_schema [Schema: Taxonomy]
        category[category]
        entity[entity]
        keyword[keyword]
        status[status]
        subject[subject]
        technique[technique]
    end

    subgraph content_schema [Schema: Content]
        article[article]
        article_i18n[article_i18n]
        article_keyword[article_keyword]
        artwork[artwork]
        artwork_technique[artwork_technique]
        artwork_colour[artwork_colour]
        artwork_keyword[artwork_keyword]
        artwork_i18n[artwork_i18n]
        contact[contact]
        contact_detail[contact_detail]
        people[people]
        content_media[media]
    end

    subgraph media_schema [Schema: Media]
        asset[asset]
        m_type[type]
        image_size[image_size]
        image_variant[image_variant]
        video_variant[video_variant]
        video_stream[video_stream]
        video_stream_variant[video_stream_variant]
    end

    subgraph security_schema [Schema: Security]
        user[user]
    end

    %% Relations principales (exemples de flux)
    content_media -.-> asset
    artwork --> category
    artwork --> status
    contact --> people
    ```