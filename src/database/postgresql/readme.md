## Architectural choices with PostgreSQL
I wanted to apply the CQRS pattern (Command Query Responsibility Segregation) to preserve data integrity through a  normalized data structure and to simplify reading queries with the Materialized Views provided by Postgresql. The use of JSONB columns inside the Materialized Views bring order into complex views. Content is also indexable with GIN indexes which enables faster search queries. Materialized Views were chosen as once published, the content of my website mcitys.com evolves rarely and content is not added every second but rather once a week.

**Least privilege** The access to a given schema is limited to specific users only. This solution provides a new layer of security and also enable scalability as it prepares a future migration from a monolithic structure to a microservices architecture.

**Schemes**


```mermaid
graph TD
    %% Définition des Schémas (Containers)
    subgraph taxonomy_schema [Schema: Taxonomy]
        category[category]
        entity[entity]
        keyword[keyword]
        language[language]
        status[status]
        subject[subject]
        technique[technique]
    end

    subgraph content_schema [Schema: Content]
        article[article]
        article_i18n[article_i18n]
        article_keywords[article_keyword]
        artwork[artwork]
        artwork_techniques[artwork_technique]
        artwork_colors[artwork_color]
        artwork_keywords[artwork_keyword]
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
    article --> article_i18n
    article_i18n --> language
    article --> article_keywords
    artwork --> category
    artwork --> status
    artwork --> subject
    artwork --> artwork_techniques
    artwork --> artwork_colors
    artwork --> artwork_keywords
    artwork --> artwork_i18n
    artwork_i18n --> language
    artwork_techniques --> technique
    artwork_keywords --> keyword
    people --> contact
    contact --> contact_detail
```