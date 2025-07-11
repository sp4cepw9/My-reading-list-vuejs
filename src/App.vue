<script>
  export default {
    data() {
      return {
        theme: "",
        list: [],
        searchText: ""
      }
    },
    created() {
      browser.storage.sync.get('theme').then(data => {
        this.theme = data.theme || 'light'
        this.setTheme(this.theme)
      })
      browser.storage.sync.get('list').then(data => {
        this.list = data.list || []
      })
      browser.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync') {
          if (changes.theme && changes.theme.newValue !== this.theme) {
            this.theme = changes.theme.newValue
            this.setTheme(this.theme)
          }
          if (changes.list) {
            const newList = changes.list.newValue
            if (JSON.stringify(newList) !== JSON.stringify(this.list)) {
              this.list = newList
            }
          }
        }
      })
    },
    computed: {
      filteredList() {
        let filtered = this.list
        if (this.searchText) {
          const search = this.searchText.toLowerCase()
          filtered = this.list.filter(
            item =>
              item.title.toLowerCase().includes(search) ||
              item.url.toLowerCase().includes(search)
          )
        }
        return filtered.slice().sort((a, b) => b.date - a.date)
      }
    },
    methods: {
      saveList() {
        browser.storage.sync.set({ list: this.list })
      },
      setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme)
        this.theme = theme
      },
      toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light'
        this.setTheme(newTheme)
        browser.storage.sync.set({ theme: newTheme })
      },
      addCurrentTab() {
        browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
          const activeTab = tabs[0]
          this.list = this.list.filter(item => item.url !== activeTab.url)
          const newItem = {
            date: Date.now(),
            title: activeTab.title,
            url: activeTab.url,
          }
          this.list.push(newItem)
          this.saveList()
        })
      },
      confirmDelete(event, item) {
        const button = event.target
        if (button.textContent === 'Confirm') {
          this.list = this.list.filter(i => i.date !== item.date)
          this.saveList()
        } else {
          button.textContent = 'Confirm'
          button.classList.add('confirmDelete')
          setTimeout(() => {
            button.textContent = 'Delete'
            button.classList.remove('confirmDelete')
          }, 4000)
        }
      },
      openTab(url, event) {
        if (event.ctrlKey || event.metaKey || event.button === 1) return
        event.preventDefault()
        browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
          browser.tabs.update(tabs[0].id, { url })
        });
      },
      clearSearch() {
        this.searchText = ""
      }
    }
  }
</script>

<template>
  <div class="flex gap-3">
    <button id="add" @click="addCurrentTab">
      <span class="opacity">Add</span> <strong>the current</strong> <span class="opacity">tab</span>
    </button>
    <button id="theme" @click="toggleTheme" class="btn w-[50px] flex items-center justify-center radius cursor-pointer">
      <span v-if="theme === 'dark'">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 16 16" fill="white">
          <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
        </svg>
      </span>
      <span v-else>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 16 16" fill="black">
          <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"/>
        </svg>
      </span>
    </button>
  </div>
  <div class="relative overflow-hidden radius my-4">
    <div class="search__icon text-white flex align-center justify-center w-[45px] absolute top-0 bottom-0">
      <svg width="18" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M10.334,11.798C9.261,12.575 7.942,13.034 6.517,13.034C2.92,13.034 0,10.114 0,6.517C0,2.92 2.92,0 6.517,0C10.114,0 13.034,2.92 13.034,6.517C13.034,7.942 12.575,9.261 11.798,10.334L15.697,14.233C16.101,14.637 16.101,15.293 15.697,15.697C15.293,16.101 14.637,16.101 14.233,15.697L10.334,11.798ZM6.517,1.983C4.015,1.983 1.983,4.015 1.983,6.517C1.983,9.019 4.015,11.05 6.517,11.05C9.019,11.05 11.05,9.019 11.05,6.517C11.05,4.015 9.019,1.983 6.517,1.983Z"/>
      </svg>
    </div>
    <input type="text" v-model="searchText" name="search" class="search__input py-[14px] px-[55px] w-full" placeholder="Search by title or URL...">
    <button class="search__clear absolute top-[8px] bottom-[8px] right-[8px] flex justify-center w-[30px] text-white radius" type="button" v-if="searchText" @click="clearSearch">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" fill="#fff" class="bi bi-x" viewBox="0 0 16 16">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
      </svg>
    </button>
  </div>
  <div v-if="list.length" class="my-4 flex justify-end">
    {{ searchText.trim() ? `${filteredList.length} result(s) out of ${list.length}` : `Number of items : ${list.length}` }}
  </div>
  <ul id="list">
    <li :id="item.date" v-for="item in filteredList" :key="item.date" class="mb-3 flex justify-between items-center cursor-pointer radius">
      <a class="link-item" :href="item.url" @click="openTab(item.url, $event)">
        <div class="favicon">
          <img :src="`https://www.google.com/s2/favicons?domain=${item.url}&sz=32`">
        </div>
        <div class="informations">
          <div class="title">{{ item.title }}</div>
          <div class="url">{{ item.url }}</div>
        </div>
      </a>
      <button class="delete" @click="confirmDelete($event, item)">Delete</button>
    </li>
  </ul>
  <div v-if="list.length" class="flex justify-end">
    <small class="selectable">Created and designed by <a href="https://sp4ce.pw" class="font-bold hover:text-rose-600!">sp4ce</a></small>
  </div>
</template>

<style scoped>

  #theme {
    background-image: var(--background-pattern);
    background-repeat: repeat-x;
  }

  #add {
    background-color: var(--third-color);
    color: #ffffff;
    cursor: pointer;
    padding: 15px 15px;
    border-radius: var(--border-radius);
    text-align: center;
    text-transform: uppercase;
    flex: 1;
    background-image: url(../images/pattern_white.png);
    background-repeat: repeat-x;
    &:hover {
      background-color: var(--third-color-hover);
    }
  }

  .search__icon {
    background-color: var(--third-color);
  }

  .search__input {
    background-color: var(--secondary-color);
    color: var(--text-color);
  }

  .search__input:focus {
    background-color: var(--secondary-color-hover);
  }

  .search__clear {
    background-color: #c6225b;
  }

  .search__clear:hover {
    background-color: #f20658;
    cursor: pointer;
  }

  #list li {
    background-color: var(--list-background-color);
    background-image: var(--background-pattern);
    background-repeat: repeat-x;
  }

  #list li:hover {
    background-color: var(--list-background-color-hover)!important;
  }

  #list li a {
    text-decoration: none;
    display: flex;
    padding: 10px 12px;
    gap: 10px;
    align-items: center;
    overflow: hidden;
    flex: 1;
  }

  #list .favicon {
    width: 28px;
    display: flex;
    flex: 0 0 auto;
    & img {
      width: 100%;
      border-radius: var(--border-radius);
    }
  }

  #list .informations {
    overflow: hidden;
    .title {
      text-overflow: ellipsis;
      overflow: hidden;
      text-wrap: nowrap;
      font-weight: 600;
    }
    .url {
      opacity: 0.6;
      font-size: 0.9em;
      text-overflow: ellipsis;
      overflow: hidden;
      text-wrap: nowrap;
    }
  }

  #list .delete {
    margin-right: 12px;
    border: 0;
    cursor: pointer;
    border-radius: var(--border-radius);
    padding: 6px 10px;
    color: var(--text-color);
    background-color: var(--btn-delete-background-color);
    &:hover {
      background-color: var(--btn-delete-background-color-hover);
    }
  }

  #list .confirmDelete, #list .confirmDelete:hover {
    background-color: var(--confirmDelete);
    color: #fff;
  }
  
</style>