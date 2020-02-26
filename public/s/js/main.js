const vm = new Vue({
  el: '#app',

  data: {
    action: '/minify', // or '/download' or '/raw'
    input: '',
    output: null,
  },

  computed: {
    isFormEnabled: function() {
      return this.input.length > 0
    }
  },

  methods: {
    onClear: function() {
      console.log('onClear()')
      this.input = ''
      this.output = null
    },

    onRaw: function() {
      console.log('onRaw()')
      this.action = '/raw'
      setTimeout(() => {
        document.getElementById('input-form').submit()
      }, 50);
    },

    onDownload: function() {
      console.log('onDownload()')
      this.action = '/download'
      setTimeout(() => {
        document.getElementById('input-form').submit()
      }, 50);
    },

    onSubmit: function(ev) {
      console.log('onSubmit() - ev:', ev)

      const params = new URLSearchParams()
      params.append('input', this.input)
      axios.post('/raw', params, {
        input: this.input,
      })
        .then(function (resp) {
          vm.output = resp.data
        })
        .catch(function (err) {
          // console.log(err)
        })
    },

    onCopyToClipboard: function() {
      const $output = document.getElementById("output")
      $output.select()
      /* for mobile devices */
      $output.setSelectionRange(0, this.output.length)
      document.execCommand("copy")
      $output.setSelectionRange(0, 0)
    },

    onSelectAll: function() {
      const $output = document.getElementById("output")
      $output.select()
      /* for mobile devices */
      $output.setSelectionRange(0, this.output.length)
    },

  },

})
