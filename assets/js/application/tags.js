function PrepareTags (tags) {
  return tags.map(function(tag){
    return { id: tag.name, text: tag.name };
  });
}
