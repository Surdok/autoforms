/** Require external modules */
const ejs = require(`ejs`);
const ezforms = require(`ezforms`);
const eztables = require(`eztables`);
const moment = require(`moment`);

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

      /** Identify ordered list properties */
      const orderedListProperties = autoform.properties().filter(x => x.list() && typeof x.listOrder() === `number`);

      /** Sort ordered list properties by list order number */
      orderedListProperties.sort((a, b) => {
        if ( a.listOrder() < b.listOrder() )
          return -1;
        else if ( a.listOrder() > b.listOrder() )
          return 1;

        return 0;
      });

      /** Add ordered list properties to query */
      orderedListProperties.forEach((property) => {
        if ( property.list() )
          query += `${property.name()}, `;
      });

      /** Identify remaining non-ordered list properties */
      const remainingListProperties = autoform.properties().filter(x => x.list() && !orderedListProperties.includes(x));

      /** Add remaining non-ordered list properties to query */
      remainingListProperties.forEach((property) => {
        if ( property.list() )
          query += `${property.name()}, `;
      });

      /** Remove trailing ', ' */
      query = query.substring(0, query.length - 2);

      /** Add FROM table name to query */
      query += ` FROM ${autoform.tableName()}`

      if ( autoform.canArchive() )
        query += ` WHERE archived = 0`;
      
      /** Add ORDER BY to query */
      query += ` ORDER BY `;

      /** Identify sort ordered properties */
      const sortOrderProperties = autoform.properties().filter(x => typeof x.sortOrder() === `number`);

      /** Sort properties by list order */
      sortOrderProperties.sort((a, b) => {
        if ( a.sortOrder() < b.sortOrder() )
          return -1;
        else if ( a.sortOrder() > b.sortOrder() )
          return 1;

        return 0;
      });
      
      /** Add list ordered fields to query */
      sortOrderProperties.forEach((property) => {
        query += `${property.name()}, `;
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
      orderedListProperties.forEach((property) => {
        table.header().text(property.listHeader());
      });

      /** Add remaining non-ordered list headers */
      remainingListProperties.forEach((property) => {
        table.header().text(property.listHeader());
      });

      /** If user is logged in and table is editable, add header placeholder for edit buttons */
      if ( req.user && ( autoform.editPermission() == -1 || req.user.permissions().includes(autoform.editPermission()) ) && autoform.canEdit() )
        table.header().text(`&nbsp;`);

      /** If user is logged in and table is archivable, add header placeholder for edit buttons */
      if ( req.user && autoform.canArchive() )
        table.header().text(`&nbsp;`);

      /** Start table body */
      table.body();

      /** Loop through each search result */
      results.forEach((row) => {
        /** Start table row */
        table.row();

        /** Loop through each column of this search result row */
        Object.keys(row).forEach((key) => {
          if ( key == `id` && !orderedListProperties.find(x => x.name() == `id`) && !remainingListProperties.find(x => x.name() == `id`) )
            return;
          
          const property = autoform.properties().find(x => x.name() == key);
          
          /** Add table data for column value */
          if ( property.type() == `date` ) {
            table.data().text(moment(row[key]).format(`MM-DD-Y`));
          } else if ( property.type() == `datetime` ) {
            table.data().text(moment(row[key]).format(`MM-DD-Y HH:mm:ss`));
          } else if ( property.type() == `time` ) {
            table.data().text(moment(row[key]).format(`HH:mm:ss`));
          } else if ( [`text`, `int`, `double`].includes(property.type()) && property.options().length > 0 ) {
            const option = property.options().find(x => x.value == row[key]);
            
            table.data().text(option.label);
          } else if ( property.type() == `color` ) {
            table.data().text(`<div style='margin: 3px; border: 1px solid black; background: ${row[key]}; min-width: 25px; min-height: 15px; '>&nbsp;</div>`);
          } else {
            table.data().text(row[key]);
          }
        });
        
        /** If user is logged in and table is editable, add header placeholder for edit buttons */
        if ( req.user && autoform.canEdit() )
          table.editButton(row.id);

        /** If user is logged in and table is archivable, add header placeholder for edit buttons */
        if ( req.user && autoform.canArchive() )
          table.archiveButton(row.id);
      });
      
      /** If there are no results... */
      if ( results.length == 0 ) {
        /** Figure out how many columns to span for a full width table cell */
        let colspan = orderedListProperties.length + remainingListProperties.length;
        
        /** Be sure to add a column for the edit icon, if needed */
        if ( req.user && autoform.canEdit() )
          colspan++;
        
        /** Be sure to add a column for the archive icon, if needed */
        if ( req.user && autoform.canArchive() )
          colspan++;
        
        /** Output row with full width cell indicating no records found */
        table.row();
        table.data().colspan(colspan).addClass(`no-results`).text(`There were no records in the database.`);
      }

      /** Query the total number of rows the previous query would pull without the limit */
      const count = await req.db.query(`SELECT FOUND_ROWS() numRows`);
      
      /** Calculate the total number of pages required to show all records in the database */
      const numPages = Math.ceil(count[0].numRows / numRows);
            
      /** Calculate current page number */
      const currentPage = offset / numRows + 1;

      /** Define some variables for list paging */
      let startPage = currentPage;
      let finishPage = currentPage;
      let numButtons = 1;
      let which = 1;
      let pagingMarkup = ``;

      /** 
       * There could be 200 pages, so let's limit ourselves to 9 page numbers and distribute
       * the page number button around the current page evenly, except when up against the
       * first or last page.  We'll do this by looping until numButtons gets to 9...
       */
      while ( numButtons < 9 ) {
        /** If it's time for a previous page button, add it */
        if ( which == 1 && startPage - 1 >= 1 ) {
          numButtons++;
          startPage--;
        } 
        
        /** Otherwise, if it's time for a next page button, add it */
        else if ( which == 2 && finishPage + 1 <= numPages ) {
          numButtons++;
          finishPage++;
        }

        /** 
         * Alternate whether to add a previous or next page button next time, if possible, and
         * break out of the loop if there are less than 9 pages in total and all buttons have
         * been distributed.
         */
        if ( which == 1 && finishPage + 1 <= numPages )
          which = 2;
        else if ( which == 2 && startPage - 1 >= 1 )
          which = 1;
        else if ( finishPage + 1 > numPages && startPage - 1 < 1 )
          break;
      }
      
      /** If this isn't the first page, add a 'far left' button */
      if ( offset - 15 >= 0 )
        pagingMarkup += `<button class='paging' type='button' onclick="javascript:location='list?offset=${Math.max(0, offset - numRows * 10)}';">&lt;&lt;</button>\n`;

      /** If this isn't the first page, add a 'previous' button */
      if ( offset - 15 >= 0 )
        pagingMarkup += `<button class='paging' type='button' onclick="javascript:location='list?offset=${offset - numRows}';">&lt;</button>\n`;
      
      /** Loop from the identified start page number to identified finish page number */
      for ( let i = startPage; i <= finishPage; i++ ) {
        /** If it's the current page's button, output button with special 'selected' class */
        if ( currentPage == i )
          pagingMarkup += `<button class='paging selected' type='button' onclick="javascript:location='list?offset=${(i - 1) * numRows}';">${i}</button>\n`;
        
        /** Otherwise, just output button */
        else
          pagingMarkup += `<button class='paging' type='button' onclick="javascript:location='list?offset=${(i - 1) * numRows}';">${i}</button>\n`;
      }
      
      /** If this isn't the last page, add a 'next' button */
      if ( offset + numRows <  count[0].numRows )
        pagingMarkup += `<button class='paging' type='button' onclick="javascript:location='list?offset=${offset + numRows}';">&gt;</button>\n`;
      
      /** If this isn't the last page, add a 'far ahead' button */
      if ( offset + numRows <  count[0].numRows )
        pagingMarkup += `<button class='paging' type='button' onclick="javascript:location='list?offset=${Math.min((numPages - 1) * numRows, offset + numRows * 10)}';">&gt;&gt;</button>\n`;

      /** Render EJS template with our rendered form */
      req.markup += ejs.render(autoform.listTemplate(), { content: table.render(6), paging: pagingMarkup });
    } catch ( err ) {
      console.log(err);
    } finally {
      await req.db.close();
    }
    
    /** Call next express handler */
    next();
  };
};
