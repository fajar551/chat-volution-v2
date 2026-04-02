props is required:

1. theadData(array) = header table
2. dataTBody(array of object) = content table

Optional props:

1. noBottom(Bool) = use for hide counting and pagination on table
2. noCountTable(Bool) = use for hide counting on table
3. countTable(Object) = use for showing counting on table

example countTable:

```javascript
const data = {
  current: 1,
  total_data: 100,
  total_page: 10,
};
```
