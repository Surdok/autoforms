/** Require external modules */
const ejs = require(`ejs`);
const ezforms = require(`ezforms`);
const eztables = require(`eztables`);

/** Require local modules */
const models = require(`../models`);

module.exports = (autoform, objClass) => {
  return async (req, res, next) => {
    try {
      /** Capture or define offset */
      const offset = req.query.offset ? parseInt(req.query.offset) : 0;
      const numRows = req.query.numRows ? parseInt(req.query.numRows) : 15;
        
      /** Begin SELECT query */
      let query = `SELECT SQL_CALC_FOUND_ROWS id, `;

      /** Identify ordered column properties */
      const orderedColumnProperties = autoform.properties().filter(x => x.showInList && typeof x.columnOrder === `number`);

      /** Sort ordered column properties by column order number */
      orderedColumnProperties.sort((a, b) => {
        if ( a.columnOrder < b.columnOrder )
          return -1;
        else if ( a.columnOrder > b.columnOrder )
          return 1;

        return 0;
      });

      /** Add ordered column properties to query */
      orderedColumnProperties.forEach((property) => {
        if ( property.showInList )
          query += `${property.name}, `;
      });

      /** Identify remaining non-ordered column properties */
      const remainingColumnProperties = autoform.properties().filter(x => x.showInList && !orderedColumnProperties.includes(x));

      /** Add remaining non-ordered column properties to query */
      remainingColumnProperties.forEach((property) => {
        if ( property.showInList )
          query += `${property.name}, `;
      });

      /** Remove trailing ', ' */
      query = query.substring(0, query.length - 2);

      /** Add FROM table name to query */
      query += ` FROM ${autoform.tableName()}`

      /** Identify list ordered properties */
      const listOrderProperties = autoform.properties().filter(x => typeof x.listOrder === `number`);

      /** Sort properties by list order */
      listOrderProperties.sort((a, b) => {
        if ( a.listOrder < b.listOrder )
          return -1;
        else if ( a.listOrder > b.listOrder )
          return 1;

        return 0;
      });

      if ( autoform.archivable() )
        query += ` WHERE archived = 0`;
      
      /** Add ORDER BY to query */
      query += ` ORDER BY `;

      /** Add list ordered fields to query */
      listOrderProperties.forEach((property) => {
        query += `${property.name}, `;
      });

      /** Remove trailing ', ' */
      query = query.substring(0, query.length - 2);

      query += ` LIMIT ${offset}, ${numRows}`;
      
      /** Await database query */
      const results = await req.db.query(query);

      /** Create EZ table */
      const table = new eztables.Table();

      /** Start table head */
      table.head();

      /** Start table row */
      table.row();

      /** Add ordered list headers */
      orderedColumnProperties.forEach((property) => {
        table.header().text(property.listHeader);
      });

      /** Add remaining non-ordered list headers */
      remainingColumnProperties.forEach((property) => {
        table.header().text(property.listHeader);
      });

      /** If user is logged in and table is editable, add header placeholder for edit buttons */
      if ( req.user && autoform.editable() )
        table.header().text(`&nbsp;`);

      /** If user is logged in and table is archivable, add header placeholder for edit buttons */
      if ( req.user && autoform.archivable() )
        table.header().text(`&nbsp;`);

      /** Start table body */
      table.body();

      /** Loop through each search result */
      results.forEach((row) => {
        /** Start table row */
        table.row();

        /** Loop through each column of this search result row */
        Object.keys(row).forEach((key) => {
          if ( key == `id` && !orderedColumnProperties.find(x => x.name == `id`) && !remainingColumnProperties.find(x => x.name == `id`) )
            return;
          
          /** Add table data for column value */
          table.data().text(row[key]);
        });
        
        /** If user is logged in and table is editable, add header placeholder for edit buttons */
        if ( req.user && autoform.editable() )
          table.editButton(row.id);

        /** If user is logged in and table is archivable, add header placeholder for edit buttons */
        if ( req.user && autoform.archivable() )
          table.archiveButton(row.id);
      });
      
      if ( results.length == 0 ) {
        let colspan = orderedColumnProperties.length + remainingColumnProperties.length;
        
        if ( req.user && autoform.editable() )
          colspan++;
        
        if ( req.user && autoform.archivable() )
          colspan++;
        
        table.row();
        table.data().colspan(colspan).addClass(`no-results`).text(`There were no records in the database.`);
      }

      const count = await req.db.query(`SELECT FOUND_ROWS() numRows`);
      
      const numPages = Math.ceil(count[0].numRows / numRows);
      const currentPage = offset / numRows + 1;

      let startPage = currentPage;
      let finishPage = currentPage;
      let numButtons = 1;
      let which = 1;
      let pagingMarkup = ``;

      while ( numButtons < 9 ) {
        if ( which == 1 && startPage - 1 >= 1 ) {
          numButtons++;
          startPage--;
        } else if ( which == 2 && finishPage + 1 <= numPages ) {
          numButtons++;
          finishPage++;
        }

        if ( which == 1 && finishPage + 1 <= numPages )
          which = 2;
        else if ( which == 2 && startPage - 1 >= 1 )
          which = 1;
        else if ( finishPage + 1 > numPages && startPage - 1 < 1 )
          break;
      }
      
      if ( offset != 0 )
        pagingMarkup += `<button class='paging' type='button' onclick="javascript:location='list?offset=${Math.max(0, offset - numRows * 10)}';">&lt;&lt;</button>\n`;

      if ( offset - numRows >= 0 )
        pagingMarkup += `<button class='paging' type='button' onclick="javascript:location='list?offset=${offset - numRows}';">&lt;</button>\n`;
      
      for ( let i = startPage; i <= finishPage; i++ ) {
        if ( currentPage == i )
          pagingMarkup += `<button class='paging selected' type='button' onclick="javascript:location='list?offset=${(i - 1) * numRows}';">${i}</button>\n`;
        else
          pagingMarkup += `<button class='paging' type='button' onclick="javascript:location='list?offset=${(i - 1) * numRows}';">${i}</button>\n`;
      }
      
      if ( offset + numRows < count[0].numRows )
        pagingMarkup += `<button class='paging' type='button' onclick="javascript:location='list?offset=${offset + numRows}';">&gt;</button>\n`;
      
      if ( offset != (numPages - 1) * numRows )
        pagingMarkup += `<button class='paging' type='button' onclick="javascript:location='list?offset=${Math.min((numPages - 1) * numRows, offset + numRows * 10)}';">&gt;&gt;</button>\n`;

      /** Render EJS template with our rendered form */
      req.markup += ejs.render(req.listTemplate, { content: table.render(6), paging: pagingMarkup });
    } catch ( err ) {
      req.log(err);
    } finally {
      await req.db.close();
    }
    
    /** Call next express handler */
    next();
  };
};
