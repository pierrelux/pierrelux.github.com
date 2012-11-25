---
layout: page
title: RLFD
tagline: Making robots less dumb
---
{% include JB/setup %}

<div class="row">
  {% for post in site.posts %}
    <div class="span4">
      <h3><a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></br><small>{{ post.date | date_to_string }}</small></h3>
      <p>
       {{ post.content | strip_html | truncatewords:75}}
       <a href="{{ post.url }}">Read more...</a>
      </p>
    </div>
  {% endfor %}
</div>

